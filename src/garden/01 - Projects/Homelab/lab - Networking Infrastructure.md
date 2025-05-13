
### VLAN Layout & Firewalling

| VLAN ID | Name  | Devices              | Example Use                        |
| ------- | ----- | -------------------- | ---------------------------------- |
| 10      | Home  | Phones, TVs, laptops | General internet browsing          |
| 20      | Guest | Visitors’ phones     | No LAN access (internet only)      |
| 30      | Mgmt  | Your workstation     | Consoles, admin & SSH etc...       |
| 40      | Lab   | K8s nodes, NAS       | Routed via firewall rules          |
| 50      | IoT   | Cameras, sensors     | Blocked from accessing other VLANs |


```mermaid
flowchart TD
    subgraph Internet
        WAN[Internet]
    end

    subgraph UniFiCloudGateway["UniFi Cloud Gateway"]
        UCG_WAN(WAN Port)
        UCG_LAN_Trunk(LAN Trunk Port to Switch)
    end

    subgraph UniFiSwitch["UniFi PoE Switch"]
        Port_DMZ("Port - VLAN 80 (DMZ)")
        Port_Homelab("Port - VLAN 40 (Homelab)")
        Port_Mgmt("Port - VLAN 30 (Mgmt)")
        Port_GNest("Port - VLAN 20 (Google Nest)")
    end

    subgraph VLAN80_DMZ["DMZ Network (VLAN 80)"]
        GameServer("Game Server - TCP 7171/7172")
        Ingress("HTTPS Proxy - TCP 443")
    end

    subgraph VLAN40_Homelab["Homelab Network (VLAN 40)"]
        K8s1("Kubernetes Node 1")
        K8s2("Kubernetes Node 2")
        NAS("NAS Storage")
    end

    subgraph VLAN30_Mgmt["Mgmt Network (VLAN 30)"]
        Workstation("Management Workstation")
        VPN("VPN Client")
    end

    subgraph GoogleNest["Google Nest Mesh (Double NAT)"]
        NestRouter("Google Nest Router")
        NestDevices("Wi-Fi Devices (IoT / Guests)")
    end

    WAN --> UCG_WAN
    UCG_LAN_Trunk --> Port_DMZ
    UCG_LAN_Trunk --> Port_Homelab
    UCG_LAN_Trunk --> Port_Mgmt
    UCG_LAN_Trunk --> Port_GNest

    Port_DMZ --> Ingress
    Port_DMZ --> GameServer

    Port_Homelab --> K8s1
    Port_Homelab --> K8s2
    Port_Homelab --> NAS

    Port_Mgmt --> Workstation
    Port_Mgmt --> VPN

    Port_GNest --> NestRouter
    NestRouter --> NestDevices

```




```mermaid

flowchart TD
    subgraph Internet
        WAN[Internet]
    end

    subgraph UniFi_Gateway["UniFi Cloud Gateway"]
        Gateway[Firewall / Router]
    end

    subgraph VLAN80_DMZ["VLAN 80 - DMZ"]
        K8sDMZ1("K8s Worker Node 4 (DMZ)")
        K8sDMZ2("K8s Worker Node 5 (DMZ)")
        GameServer("Game Server Pod")
        Ingress("Ingress Proxy (443)")
    end

    subgraph VLAN40_Homelab["VLAN 40 - Homelab"]
        K8sCP("K8s Control Plane (API Server)")
        K8sWorker1("K8s Worker Node 1")
        K8sWorker2("K8s Worker Node 2")
        NAS("NAS Storage")
    end

    subgraph VLAN30_Mgmt["VLAN 30 - Mgmt"]
        AdminPC("Management Workstation")
        VPN("VPN Client")
    end

    WAN --> Gateway
    Gateway --> K8sDMZ1
    Gateway --> K8sDMZ2

    K8sDMZ1 -->|TCP 443/7171| GameServer
    K8sDMZ2 -->|TCP 443| Ingress

    K8sDMZ1 -->|TCP 6443| K8sCP
    K8sDMZ2 -->|TCP 6443| K8sCP

    AdminPC -->|SSH/Kubectl| K8sCP
    VPN -->|SSH/Kubectl| K8sCP

    K8sWorker1 --> K8sCP
    K8sWorker2 --> K8sCP
    K8sWorker1 --> NAS
    K8sWorker2 --> NAS

    classDef dmz fill:#fdd;
    classDef homelab fill:#ddf;
    classDef mgmt fill:#dfd;
    classDef internet fill:#eee,stroke:#bbb;

    class VLAN80_DMZ dmz;
    class VLAN40_Homelab homelab;
    class VLAN30_Mgmt mgmt;
    class Internet internet;

```