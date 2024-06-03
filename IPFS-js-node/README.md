```markdown
# Setting up a IPFS Node

## System Information

Check the username and OS by running:
```sh
uname -a
```

## Download and Install IPFS

1. Go to [IPFS distributions](https://dist.ipfs.tech/#kubo) and download the Kubo (go-ipfs) Linux binary (64-bit).
2. Download the binary using the terminal:
    ```sh
    wget https://dist.ipfs.tech/kubo/v0.28.0/kubo_v0.28.0_linux-amd64.tar.gz
    ```
3. Extract the downloaded binary:
    ```sh
    tar -xvf kubo_v0.28.0_linux-amd64.tar.gz
    ```

## Move IPFS to Local Bin

1. List the contents to verify extraction:
    ```sh
    ls kubo
    ```
2. Move `ipfs` to `/usr/local/bin` to access it from any directory:
    ```sh
    sudo mv kubo/ipfs /usr/local/bin/
    ```

## Verify Installation

Check if IPFS is globally accessible:
```sh
ipfs --version
```

## Initialize IPFS

Initialize the IPFS node:
```sh
ipfs init
```
Start the IPFS daemon:
```sh
ipfs daemon
```

## Create IPFS Service

1. Create a service file for IPFS:
    ```sh
    sudo touch /etc/systemd/system/ipfs-node.service
    ```
2. Edit the service file:
    ```sh
    sudo vi /etc/systemd/system/ipfs-node.service
    ```
   Example content:
    ```ini
    [Unit]
    Description=IPFS daemon
    After=network.target

    [Service]
    ExecStart=/usr/local/bin/ipfs daemon
    Restart=always
    User=<your-username>
    Group=<your-group>
    Environment="IPFS_PATH=/var/lib/ipfs"

    [Install]
    WantedBy=multi-user.target
    ```

## Enable and Start the Service

1. Enable the IPFS service to start on boot:
    ```sh
    sudo systemctl enable ipfs-node.service
    ```
2. Start the IPFS service:
    ```sh
    sudo systemctl start ipfs-node.service
    ```
3. Reload the system daemon:
    ```sh
    sudo systemctl daemon-reload
    ```
4. Start the service again:
    ```sh
    sudo systemctl start ipfs-node.service
    ```
5. Stop the service:
    ```sh
    sudo systemctl stop ipfs-node.service
    ```

## Check Service Status

Check the status of the IPFS service:
```sh
sudo systemctl status ipfs-node.service
```

## IPFS Identity and Peers

1. View the IPFS node identity:
    ```sh
    ipfs id
    ```
2. View connected peers:
    ```sh
    ipfs swarm peers
    ```

## Adding and Retrieving Data

1. Add data to IPFS:
    ```sh
    echo "hello world" | ipfs add
    ```
   This will generate a CID for the data.

2. Retrieve data using the CID:
    ```sh
    ipfs cat <cid>
    ```

## Adding Files to IPFS

1. Create a text file:
    ```sh
    echo "aditya" > aditya.txt
    cat aditya.txt
    ```
2. Add the file to IPFS:
    ```sh
    ipfs add aditya.txt
    ```
3. Retrieve the file using its CID:
    ```sh
    ipfs cat <file_cid>
    ```

## Firewall Configuration

Ensure the necessary ports are open:
```sh
sudo ufw allow 4001
sudo ufw allow 5001
sudo ufw allow 8080
```