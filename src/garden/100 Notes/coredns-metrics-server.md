---
title: Metrics Server and CoreDNS (K3s)
draft: false
tags:
  - kubernetes
  - k3s
  - tls
  - encryption
  - https
  - homelab
---

```
kubectl logs -n kube-system deployment/metrics-server
```

```
kubectl get --raw /apis/metrics.k8s.io/v1beta1/nodes
```



restart k3s control plane (and nodes?)

```
kubectl delete pod -n kube-system -l k8s-app=metrics-server
```
