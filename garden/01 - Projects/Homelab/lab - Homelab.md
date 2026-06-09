On technology as a contemplative practice ([[2025-05-01]])

Talos, Kubernetes, Proxmox with OpenTofu
https://blog.stonegarden.dev/articles/2024/08/talos-proxmox-tofu/#main-course
https://github.com/vehagn/homelab

**6-node M910Q cluster with 16GB RAM per node**

#### Modem

[NBN CM8200](https://www.nbnco.com.au/content/dam/nbnco2/documents/1730118_HFC_Setup_Guide_180x130mm_PAY%20TV_1.0_ONLINE.pdf)

#### Router

[Ubiquiti Cloud Gateway Ultra](https://techspecs.ui.com/unifi/cloud-gateways/ucg-ultra?subcategory=all-cloud-gateways)
Price: [$198.00](https://www.amazon.com.au/gp/product/B0DMWVMMNC?smid=ANEGB3WVEVKZB&psc=1)

#### Switch

[Ubiquiti Lite 8 PoE Layer 2 Switch](https://techspecs.ui.com/unifi/switching/usw-lite-8-poe?subcategory=all-switching)
Price: [$199.00](https://www.amazon.com.au/gp/product/B0C6BPKXDF?smid=ANEGB3WVEVKZB&psc=1)

### Platform

- Talos
- Cilium
- Longhorn
- cert-manager
- FluxCD

### Identity & Secrets

- External Secrets Operator
- Keycloak
- Vault

### Observability

- Prometheus
- Grafana
- Loki

### Data

- PostgreSQL
- Airflow
- Kafka
- dbt

### Operations

- Gatus
- GitHub Actions Runner Controller

### Networking

- Cloudflare DNS
- Cloudflare Tunnel

### Optional

- UniFi Controller
- OpenTelemetry ?

```
infrastructure/
├── talos/
├── kubernetes/
├── flux/
├── apps/
│   ├── keycloak/
│   ├── kafka/
│   ├── airflow/
│   ├── grafana/
│   ├── vault/
│   └── .../
└── clusters/
```
