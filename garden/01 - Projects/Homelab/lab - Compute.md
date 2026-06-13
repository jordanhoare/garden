## Context

Bare-metal Kubernetes homelab for learning enterprise cloud-native tooling. Rack fits max 6 mini PCs. Target: senior/staff platform engineer roles at companies like Google, Block, or ByteDance.

### Target Stack

- **Platform:** Talos Linux, Cilium, FluxCD, cert-manager
- **Identity & Secrets:** Keycloak, 1Password + External Secrets Operator
- **Observability:** Prometheus, Grafana, Loki, Gatus
- **Operations:** GitHub Actions Runner Controller
- **Networking:** Cloudflare DNS + Tunnel, Ubiquiti UCG Ultra + USW Lite 8 PoE
- **Storage:** Rook+Ceph (block + object). See [[lab - Storage]].
- **Security:** Falco, Kyverno, Trivy. See [[lab - Security]].

### Requirements

1. All nodes identical hardware — no mixed scheduling, no "which node died?" debugging
2. Survive any single node being pulled with applications staying online
3. Fully declarative GitOps (Flux, Renovate, Talos machineconfig in Git)
4. Network segmentation for public endpoints without compromising home network
5. No external storage — everything internal to the nodes
6. Future eGPU support for local LLM inference is desirable but not a hard requirement

### Resource Requirements

Estimated steady-state RAM across the cluster:

|Component|RAM|
|---|---|
|Talos + kubelet + Cilium (per node)|~2 GB|
|Ceph (OSDs + MON + MGR)|~16–20 GB total|
|Prometheus (HA) + Grafana + Loki|~8–10 GB|
|Keycloak (HA) + 1Password Connect + ESO|~3–4 GB|
|Flux, cert-manager, Gatus, ARC, Tunnel|~2–3 GB|
|Security tooling (Falco, Kyverno)|~1.5–2 GB|
|**Total with Ceph**|**~31–35 GB**|

N-1 failure scenario is the critical test — all evicted pods reschedule, Ceph recovery increases memory pressure at the exact moment capacity drops.

### Why 32GB per node

- 4 × 16GB = 64 GB total, ~42 GB allocatable on N-1. Only 4–6 GB headroom with Ceph — OOM risk during recovery + ARC spikes.
- 3 × 32GB = 96 GB total, ~56 GB allocatable on N-1. ~18–20 GB headroom with Ceph — comfortable.
- DDR4 16GB SO-DIMMs are $220+ in AU. Upgrading 4 refurb nodes to 32GB ($880) costs more than buying 32GB soldered.

## Options Evaluated

[Full Amazon AU search — 32GB+ mini desktops, sorted by price](https://www.amazon.com.au/s?keywords=Mini+Desktop+Computers&i=computers&rh=n%3A4913358051%2Cp_36%3A-90000%2Cp_123%3A241862%257C253265%257C469218%257C791635%2Cp_n_feature_three_browse-bin%3A211420567051%2Cp_72%3A2547912051&s=price-asc-rank&dc&c=ts&qid=1781304620&rnid=4934639051&ts_id=4913358051&ref=sr_nr_p_n_g-1004209391091_1&ds=v1%3A%2BYpPfwJGtnL1le9CAeWPaQHsAf%2BrjuaUQsU7WmD7C84)

### Enterprise Refurbs (16GB, $349–459/node)

Warrantied AU sellers: [UN Tech](https://www.untech.com.au), [Reboot-IT](https://reboot-it.com.au), [Recompute](https://www.recompute.com.au), Amazon AU Renewed.

|Machine|Spec|Price|Link|
|---|---|---|---|
|Lenovo M720q i5-8400T|6C/6T, 16GB, 256GB NVMe|$349|[UN Tech](https://www.untech.com.au/products/lenovo-thinkcentre-m720q-mini-desktop-pc-i5-8400t-16gb-ram-ssd-win-11)|
|Lenovo M720q i7-8700T|6C/12T, 16GB, 256GB|$399|[UN Tech](https://www.untech.com.au/products/lenovo-thinkcentre-m720q-tiny-desktop-pc-i7-8700t-16gb-ram-256gb-ssd-win-11)|
|HP ProDesk 400 G6 i5-10500T|6C/12T, 16GB, 256GB|$410|[Amazon AU](https://www.amazon.com.au/HP-ProDesk-i5-10500T-256GB-Windows/dp/B0FWK3LZB7)|
|Dell OptiPlex 7090 i5-10500T|6C/12T, 16GB, 256GB, WiFi|$459|[Amazon AU](https://www.amazon.com.au/DELL-Optiplex-7090-Desktop-Renewed/dp/B0GMLPTJNC)|

- Proven Talos support, 2.5" Ceph OSD bay, socketed RAM
- Killed by the 16GB ceiling — see "Why 32GB per node" above

### Consumer Minis (BOSGAME, GMKtec, PELADN, etc.)

Ruled out. Most are 4C despite "Ryzen 5" branding, soldered low RAM, single M.2, uncertain Linux support, no local warranty.

### Minisforum

|Machine|Spec|Price|Link|
|---|---|---|---|
|UM870 Slim barebone|8C/16T, USB4, DDR5 SODIMM|~$777 kitted|[Amazon AU](https://www.amazon.com.au/dp/B0DG9B2JGF)|
|UM880 Plus barebone|8C/16T, OCuLink+USB4, DDR5 SODIMM|~$837 kitted|[Amazon AU](https://www.amazon.com.au/dp/B0DG9B2JGF)|
|UM690L 6900HX|8C/16T, USB4, 32GB LPDDR5, 1TB|$800|[Amazon AU](https://www.amazon.com.au/MINISFORUM-UM690L-Computer-PCIe-Output/dp/B0CX8KQ1WZ)|
|MS-A2 7745HX barebone|8C/16T, PCIe x16, 10G SFP+, 3×M.2|~$957 kitted|[Amazon AU](https://www.amazon.com.au/MINISFORUM-Ryzen-7745HX-5-1GHz-PCIe%C3%9716/dp/B0GSZMD8TL)|

- Barebones need kitting: [Crucial DDR5 16GB $259](https://www.amazon.com.au/Crucial-5600MHz-5200MHz-4800MHz-CT16G56C46S5/dp/B0BLTGMCB7) + [fanxiang 256GB NVMe $68](https://www.amazon.com.au/fanxiang-S500-Pro-Internal-Compatible/dp/B0B55SWRCY) = $327/node
- Best hardware but fleet costs $2,400–3,800
- UM690L closest competitor to the eventual winner but single M.2 (no Ceph OSD isolation), 6nm Zen 3+ (~19% slower), 1-year warranty

### Beelink

|Machine|Spec|Price|Link|
|---|---|---|---|
|EQR6 6800U|8C/16T, 32GB LPDDR5, 500GB|$729|[Amazon AU](https://www.amazon.com.au/dp/B0DHWRM6GT)|
|SER5 MAX 6800U|8C/16T, 32GB LPDDR5, 1TB|$773|[Amazon AU](https://www.amazon.com.au/dp/B0CTZLBFM7)|
|**SER9 Pro H255**|**8C/16T, 32GB LPDDR5X, 500GB, dual M.2, USB4, 2.5GbE**|**$795**|**[Amazon AU](https://www.amazon.com.au/dp/B0G4V467WH)**|
|EQI13 Pro 13620H|10C/16T (hybrid), 32GB DDR4, 1TB|$892|[Amazon AU](https://www.amazon.com.au/dp/B0CYTZ16WC)|

- EQR6 / SER5 MAX: no USB4, 1GbE only
- EQI13 Pro: Intel hybrid P+E cores (unpredictable scheduling), DDR4, no USB4, 2.8★
- SER8 (upgradeable DDR5 SODIMM, USB4) would be ideal but $1,634 on Amazon AU

### 3 vs 4 Nodes

| |3 nodes|4 nodes|
|---|---|---|
|etcd quorum on N-1|2/3 — holds|3/4 — holds|
|Ceph on N-1|data available, can't rebuild until node returns|self-heals immediately|
|HA replica spread on N-1|2 nodes — works|3 nodes — comfortable|
|Degraded window risk|second failure = potential data loss (mitigate with UPS)|second failure = degraded only|
|Cost (SER9 Pro)|$2,384|$3,178|

Ceph self-heals automatically on node return — see [[lab - Storage]] for details.

Proxmox rejected: not GitOps-native, two management planes, two update paths, virtualisation overhead with no benefit for Talos.

## Decision

**3 × [Beelink SER9 Pro H255](https://www.amazon.com.au/dp/B0G4V467WH) — $794.53 each — $2,383.59 total**

|Spec| |
|---|---|
|CPU|AMD Ryzen 7 H255, 8C/16T Zen 4, 4nm, up to 4.9GHz|
|RAM|32GB LPDDR5X (soldered)|
|Storage|500GB PCIe 4.0 + empty 2nd M.2 PCIe 4.0 slot|
|Connectivity|USB4, 2.5GbE, WiFi 6, BT 5.2|
|Warranty|3-year Beelink|

All three nodes as schedulable control plane. Dual M.2 slots enable proper Ceph OSD isolation — see [[lab - Storage]].

### Why SER9 Pro over the alternatives

|Alternative|Gap|
|---|---|
|Enterprise refurbs (4 × 16GB)|Can't run Ceph on N-1 without OOM. RAM upgrade costs more than SER9 Pro fleet.|
|Minisforum UM690L|Single M.2, 6nm Zen 3+ (~19% slower), 1-year warranty, $16 more total|
|Beelink SER5 MAX|No USB4, 1GbE only|
|Beelink EQI13 Pro|Hybrid P/E cores, DDR4, no USB4, higher price|

### Upgrade Path

| Phase                            | Cost      |
| -------------------------------- | --------- |
| Day one — 3 × SER9 Pro           | $2,384    |
| Ceph OSD drives — 3 × 512GB NVMe | ~$300     |
| 4th node (Ceph self-healing)     | ~$795     |
| eGPU dock for LLM inference      | ~$150–250 |
