// @ts-nocheck
import gunLib from "gun";
import http from "http";
import { createLibp2p } from "libp2p";
import { tcp } from "@libp2p/tcp";
import { mplex } from "@libp2p/mplex";
import { noise } from "@chainsafe/libp2p-noise";
import { bootstrap } from "@libp2p/bootstrap";
import { mdns } from "@libp2p/mdns";
import { kadDHT } from '@libp2p/kad-dht';
import { MemoryBlockstore } from 'blockstore-core';
import { MemoryDatastore } from 'datastore-core';
import { createHelia } from 'helia';
import { unixfs } from '@helia/unixfs';
import { CID } from 'multiformats/cid';
import express from 'express';
import cors from 'cors';

const blockstore = new MemoryBlockstore();
const datastore = new MemoryDatastore();

const libp2p = await createLibp2p({
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


const node = await createHelia({datastore, blockstore, libp2p});
const fs = unixfs(node);
const encoder = new TextEncoder()
const decoder = new TextDecoder()

const app = express();
app.use(express.json())
const corsOptions = {
  origin: function (origin, callback) {
    callback(null, true)
  }
}

app.use(cors(corsOptions));
app.post("/", async function (req, res) {
    const cid = await fs.addBytes(encoder.encode(req.body.payload))
    res.send({cid: cid.toString()});
});

app.get("/:cid", async function(req, res) {
    let text = ''
    for await (const chunk of fs.cat(CID.parse(req.params.cid))) {
        text += decoder.decode(chunk, {
            stream: true
        })
    }
    res.send({text: text});
})

app.listen(3000, function () {
    console.log(`API listening on port 3000!`);
});

var peers = [];
 
libp2p.addEventListener('peer:discovery', (evt) => {
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