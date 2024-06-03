#!/bin/bash

# Print system information
echo "System Information:"
uname -a

# Download and install IPFS
echo "Downloading IPFS..."
wget https://dist.ipfs.tech/kubo/v0.28.0/kubo_v0.28.0_linux-amd64.tar.gz
echo "Extracting IPFS..."
tar -xvf kubo_v0.28.0_linux-amd64.tar.gz

# Move IPFS binary to local bin
echo "Moving IPFS to /usr/local/bin..."
sudo mv kubo/ipfs /usr/local/bin/

# Verify installation
echo "Verifying IPFS installation..."
ipfs --version

# Check for port conflicts before initializing IPFS
echo "Checking for port conflicts..."
if sudo netstat -tulpn | grep -E '4001|5001|8080'; then
    echo "Detected port conflict with IPFS ports. Attempting to resolve..."
    # Kill all processes that are using IPFS ports
    sudo fuser -k 4001/tcp 4001/udp 5001/tcp 8080/tcp
    echo "Port conflicts resolved. Continuing with IPFS setup."
fi

# Initialize IPFS if not already done
if [ ! -d "$HOME/.ipfs" ]; then
    echo "Initializing IPFS..."
    ipfs init
else
    echo "IPFS already initialized."
fi

# Increase UDP buffer sizes
echo "Increasing UDP buffer sizes..."
echo "net.core.rmem_max=2097152" | sudo tee -a /etc/sysctl.conf
echo "net.core.rmem_default=2097152" | sudo tee -a /etc/sysctl.conf
echo "net.core.wmem_max=2097152" | sudo tee -a /etc/sysctl.conf
echo "net.core.wmem_default=2097152" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Create IPFS service
echo "Creating IPFS service file..."
sudo touch /etc/systemd/system/ipfs-node.service
echo "Editing IPFS service file..."
echo "[Unit]
Description=IPFS daemon
After=network.target

[Service]
ExecStart=/usr/local/bin/ipfs daemon
Restart=always
RestartSec=10
User=$(whoami)
Group=$(id -gn $(whoami))
Environment=\"IPFS_PATH=$HOME/.ipfs\"

[Install]
WantedBy=multi-user.target" | sudo tee /etc/systemd/system/ipfs-node.service

# Enable and start the service
echo "Enabling and starting IPFS service..."
sudo systemctl daemon-reload
sudo systemctl enable ipfs-node.service
sudo systemctl restart ipfs-node.service

# Check service status
echo "IPFS service status:"
sudo systemctl status ipfs-node.service
