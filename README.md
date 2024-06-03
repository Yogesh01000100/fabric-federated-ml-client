# Dependencies:
- Node.js ^18
- Docker and Docker Compose
- Python ==3.10.x
- Git

### Clone repository in /home
- git clone https://github.com/Yogesh01000100/fabric-federated-ml-client-network.git

## Docker steps:

```bash
sudo apt-get update
```
```bash
sudo apt install docker.io
```
```bash
newgrp docker
```
```bash  
sudo usermod -aG docker $USER    # (restart the PC after this step)
```
```bash
sudo systemctl enable docker
```
```bash
sudo systemctl start docker
```
```bash
sudo systemctl status docker
```
```bash
sudo apt install docker-compose
```
## Network Creation steps:

chmod +x __.sh first time

```bash
./install-fabric.sh b
```
```bash
./create-network.sh
```
```bash
npm run install-deps
```
```bash
./enroll-admin.sh
```
```bash
./create-ipfs-service.sh
```
```bash
sudo systemctl start ipfs-node.service  # (start the ipfs node)
```

## Status Checks

- http://localhost:5984/_utils/
- http://127.0.0.1:5001/webui
