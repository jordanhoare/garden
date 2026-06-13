## Context

Storage for a 3-node bare-metal Kubernetes homelab running on [Beelink SER9 Pro H255](https://www.amazon.com.au/dp/B0G4V467WH) nodes (32GB RAM, dual M.2 PCIe 4.0 slots). Full resource requirements in [[lab - Compute]].

Primary motivation is **deep learning of distributed storage fundamentals** — not just getting PVCs working. Target career path is senior/staff platform/SRE engineering where understanding storage at the systems level matters more than familiarity with any specific product.

### What the Stack Needs

Two distinct needs: **block** (PVCs for stateful workloads) and **object** (S3-compatible API for backups, WAL archiving, Loki backend).

|Component|Storage type|Volume|
|---|---|---|
|Postgres (CloudNativePG)|Block (RWO PVC)|10–50 GB|
|Keycloak (Postgres backend)|Block (RWO PVC)|<5 GB|
|1Password Connect|Block (RWO PVC)|<1 GB|
|Prometheus TSDB|Block (RWO PVC)|20–50 GB (15d retention)|
|Loki chunks + index|Block or Object (S3)|10–30 GB|
|Grafana|Block (RWO PVC)|<1 GB (dashboards in Git via Flux)|
|WAL archives + backups|Object (S3 API)|grows over time|
|**Total realistic**||**~50–150 GB**|

## Decision: Rook+Ceph from Day One

Rook+Ceph as the sole storage backend, providing RBD (block), RadosGW (object), and optionally CephFS (shared filesystem) from a single system.

### Why Not Phase In with Longhorn First

Starting with Longhorn is safer operationally but creates a real risk of never making the jump to Ceph. Ceph is a sort-of capstone learning goal for my homelab — it teaches distributed storage primitives that no other open-source tool exposes as directly. Getting it working (and dealing with all of the related debugging) on real hardware is the point, not so much the storage itself.

### Why Ceph Teaches What Matters

Typical interview questions aren't "have you used Ceph" — it's "do you understand distributed storage at the systems level? explain the difference..." Companies at the target level typically run custom or managed storage, not Ceph. But Ceph exposes every layer those systems implement internally:

|Concept|How Ceph teaches it|Where it appears at scale|
|---|---|---|
|Data placement / consistent hashing|CRUSH algorithm — you write the rules, watch data move|Dynamo, Cassandra, every sharded system|
|Replication vs erasure coding|Ceph pools support either — observe the tradeoffs|GCS, S3, Azure (EC for cold, replication for hot)|
|Placement groups / sharding|PGs are the unit of replication — too few = hot spots, too many = overhead|Spanner, DynamoDB, Kafka partitions|
|Failure domains / topology awareness|CRUSH maps encode host/rack/DC hierarchy|Every cloud provider's AZ-aware replication|
|Quorum and consistency|primary-copy with min_size quorum|Raft (etcd), Paxos (Spanner), quorum reads (Dynamo)|
|Block vs object vs file over the same pool|RBD, RadosGW, CephFS all sit on RADOS|GCS/S3 are object APIs, PD/EBS are block APIs — same underlying stores|
|Recovery and rebalancing|Kill an OSD, watch PG remapping and backfill in real time|Every distributed system does this, few let you watch|
|Storage engine internals|BlueStore WAL, RocksDB metadata, direct block management|LSM trees underpin half of modern storage|

Longhorn doesn't teach any of this. It replicates block devices across nodes — useful operationally, zero insight into placement, erasure coding, or how object storage works.

## Physical Storage Layout

Each SER9 Pro has dual M.2 PCIe 4.0 slots. Proper I/O isolation between OS and Ceph — no partition sharing, no contention.

|Slot|Drive|Purpose|
|---|---|---|
|Slot 1|500GB (included)|Talos OS + ephemeral|
|Slot 2|512GB–1TB (purchased)|**Dedicated Ceph OSD**|

### OSD Drive Selection

|Size|× 3 nodes, 3× replication|Usable capacity|Estimated AU price × 3|
|---|---|---|---|
|512 GB|~512 GB usable|plenty for current stack|~$300|
|1 TB|~1 TB usable|headroom for growth|~$390|

**Recommendation: 1TB per node.** Price delta is small (~$30/drive) and Ceph degrades as OSD utilisation approaches 85%.

**Drive type matters:** avoid QLC NAND. Ceph hammers sync writes and QLC endurance is poor. TLC with DRAM cache is the minimum. Used enterprise NVMe (Intel P4510, Samsung PM9A3) is ideal if available.

## Ceph Architecture

### Pool Configuration

|Pool|Type|Replication|Purpose|
|---|---|---|---|
|rbd-pool|Replicated, size=3, min_size=2|3× across hosts|Block PVCs (Postgres, Keycloak, Prometheus, etc.)|
|rgw-pool|Replicated, size=3, min_size=2|3× across hosts|RadosGW S3-compatible object storage|

CRUSH rule: `chooseleaf host` — replicas on different physical nodes. Rook configures this by default.

### Daemon Placement

|Daemon|Count|RAM per instance|
|---|---|---|
|OSD|3 (one per node)|~4 GB (osd_memory_target)|
|MON|3|~1–2 GB|
|MGR|2 (active + standby)|~512 MB|
|RadosGW|2|~512 MB|
|Rook Operator|1|~512 MB|
|**Total Ceph RAM**||**~18–22 GB across cluster**|

### Replication and Self-Healing

|Scenario|Data status|Reads/writes|Self-healing|
|---|---|---|---|
|All healthy|3 copies on 3 hosts|normal|—|
|1 node down|2 copies on 2 hosts|**continues (min_size=2)**|can't rebuild — only 2 hosts remain|
|1 node returns|3 hosts available|normal|**backfills automatically, zero intervention**|
|2 nodes down|1 copy on 1 host|**blocked**|stalls until a node returns|

Degraded window lasts until the failed node returns. Risk of coincident second failure mitigated by UPS. Adding a 4th node (see [[lab - Compute]] upgrade path) eliminates this — Ceph rebuilds immediately.

## Backup Strategy

**Backing up to the same Ceph cluster is not a backup.** Cluster-level disaster = everything gone.

### Backup Tools

|Tool|What it backs up|How|
|---|---|---|
|**[CloudNativePG](https://cloudnative-pg.io/)**|Postgres databases|continuous WAL archiving + daily base backups to RadosGW **and** Cloudflare R2|
|**[Volsync](https://volsync.readthedocs.io/)**|all other PVCs (Prometheus, Grafana, Keycloak, 1Password Connect)|snapshots PVCs, replicates to R2 on schedule|
|**`talosctl etcd snapshot`**|etcd|daily + before upgrades, to R2|
|**Git (Flux)**|cluster state, Grafana dashboards, Talos machineconfigs|inherent — Git is source of truth|
|**1Password cloud**|secrets|managed by 1Password, no local backup needed|

Volsync complements CloudNativePG: CNPG handles Postgres-specific backup (WAL + PITR), Volsync handles generic PVC backup for everything else. Together they cover all stateful data.

### Off-Cluster Backup Target

|Provider|Free tier|Notes|
|---|---|---|
|**Cloudflare R2**|10 GB, no egress fees|best for restores — no egress charges|
|Backblaze B2|10 GB|cheapest raw storage|

Homelab generates <10GB backup data. **Cloudflare R2 free tier** covers it indefinitely.

## CloudNativePG Integration

|Function|Storage backend|Notes|
|---|---|---|
|Database PVC|Ceph RBD (block)|RWO PVC per instance, StorageClass → rbd-pool|
|WAL archiving|RadosGW + Cloudflare R2|continuous streaming, two destinations|
|Base backups|RadosGW + Cloudflare R2|daily, stored as S3 objects|
|PITR|restore from base backup + replay WAL|block + object working together in one recovery flow|

S3 credentials for RadosGW and R2 managed via 1Password + ESO — see [[lab - Security]].

## Capacity Planning (3 × 1TB OSD)

| |Value|
|---|---|
|Raw capacity|3 TB|
|Usable (3× replication)|~1 TB|
|Target max utilisation|85% (~850 GB)|
|Current stack needs|~50–150 GB|
|Headroom|**~700–800 GB**|

## Consequences

- Ceph from day one = harder to operate initially. Misconfigurations can cause data loss. Acceptable — it's a lab.
- RadosGW provides on-cluster S3 for Loki and CloudNativePG WAL. Off-cluster R2 backup essential for anything that matters.
- Volsync covers PVC backup for non-Postgres stateful workloads.
- Dual M.2 = OS and Ceph properly isolated. OSD failure doesn't affect OS.
- 4th node adds a 4th OSD (raw → 4TB, ~1.3TB usable) and enables automatic self-healing.
