// @ts-nocheck
import gunLib from "gun";
import http from "http";
import { createLibp2p } from "libp2p";
import { tcp } from "@libp2p/tcp";
import { mplex } from "@libp2p/mplex";
import { noise } from "@chainsafe/libp2p-noise";
import { bootstrap } from "@libp2p/bootstrap";
import { mdns } from "@libp2p/mdns";
import { kadDHT } from '@libp2p/kad-dht'

const node = await createLibp2p({
    transports: [ tcp() ],
    addresses: {
        listen: ['/ip4/0.0.0.0/tcp/0']
    },
    streamMuxers: [ mplex() ],
    connectionEncryption: [ noise() ],
    peerDiscovery: [
        bootstrap({
            list:[
                "/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",
                "/ip4/104.131.131.82/udp/4001/quic/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ"
            ]
        }),
        mdns({interval: 1000})
    ],
    services: {
        dht: kadDHT(),
    }
});

/*node.addEventListener('peer:connect', (evt) => {
    console.log('Connection established to:', evt.detail);
    console.log(node.getMultiaddrs());
});*/

var peers = [];
  
node.addEventListener('peer:discovery', (evt) => {
    if (evt.detail.addresses[1]) {
        peers.push(evt.detail.addresses[1].multiaddr.toString().split('/')[2] + ':8081')
    }
});


setTimeout(() => {
    console.log(peers);
    const port = 8080;
    const server = http.createServer().listen(port);
    const gun = gunLib({
    web: server,
    peers: peers
    });
    console.log("gun listening on port ", port);
}, 5000);