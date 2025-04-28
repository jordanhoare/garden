---
title: Traefik Ingress Controller
draft: false
tags:
  - kubernetes
  - tls
  - encryption
  - ingress-controller
  - k3s
  - reverse-proxy
  - load-balancer
  - https
  - homelab
---

Traefik terminates the SSL on its side for services running inside the Kubernetes cluster. It can use any valid certificate you configure (e.g., Let's Encrypt, self-signed, or other).

1. This line means Traefik will match any incoming HTTP request that has the Host header set to status.mythbound.dev. This header is set by the client (e.g., a browser) when making a request.

```yaml
match: Host(`status.mythbound.dev`)
```

2. Traefik will direct the matched request to the Kubernetes service named gatus on port 8080.
```yaml
services:
  - name: gatus
    port: 8080
```

### Summary of Traffic Flow:
Client → Cloudflare:
    The client connects to Cloudflare over HTTPS.
    Cloudflare terminates the SSL/TLS connection and verifies the certificate for the domain (either a Cloudflare-issued certificate or one you provided).

Cloudflare → OCI Load Balancer → NGINX:
    Cloudflare forwards the request to your origin (the OCI Load Balancer) over HTTPS.
    The OCI Load Balancer forwards the request to the pass-through proxy over TCP (without terminating SSL).
    NGINX forwards the encrypted traffic to the Traefik ingress controller (without terminating SSL/TLS).

Traefik (SSL/TLS Termination):
    Traefik will terminate the SSL/TLS connection using the certificate stored as a Kubernetes secret, allowing it to handle HTTPS traffic.
    Traefik will then route the request to the appropriate service inside your Kubernetes cluster (e.g., gatus for status.mythbound.dev).


kubectl create secret tls gatus-tls \
  --cert=public_cert.pem \
  --key=private_key.pem \
  --namespace=kube-system