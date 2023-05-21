// @ts-nocheck
import wink from 'wink-nlp';
import its from 'wink-nlp/src/its.js';
import model from 'wink-eng-lite-web-model';
import levenshtein from 'js-levenshtein';
import convnetjs from 'convnetjs';

var docs = []
var net;

function constructTensor(docs, doc) {
    let m = [];
    for (let i = 0; i < docs.length; i++) {
        let a = []
        let currentDoc = docs[i];
        currentDoc.tokens().each(t => {
            let b = []
            let word = t.out(its.normal)
            doc.tokens().each(t2 => {
                let word2 = t2.out(its.normal);
                b.push(similarityBetweenWords(word, word2));
            });
            complete(b, 30);
            a.push(b);
        });
        m.push(a);
    }
    //console.log(m)
    return new convnetjs.Vol(m);
}

function complete(array, n) {
    let nr = n - array.length
    for (let i = 0; i < nr; i++) {
        array.push(0);
    }
}

function similarityBetweenWords(w1, w2) {
    return 1-levenshtein(w1, w2)/Math.max(w1.length, w2.length);
}

function constructTrainingX() {
    var data = JSON.parse(localStorage.getItem("votes") || "[]");
    let response = [];
    docs = [];
    for (let i = 0; i < data.length; i++) {
        docs.push(wink(model).readDoc(data[i].text));
    }

    for (let i = 0; i < data.length; i++) {
        response.push(constructTensor(docs, docs[i]))
    }
    
    return response;
}

function constructTest(text) {
    let doc = wink(model).readDoc(text)
    return constructTensor(docs, doc);
}

function constructTrainingY() {
    var data = JSON.parse(localStorage.getItem("votes") || "[]");
    let response = []
    for (let i = 0; i < data.length; i++) {
        response.push(data[i].like);
    }
    return response;
}

function buildModel() {
    let layers = [];
    layers.push({type: 'input', out_sx: 30, out_sy: 30, out_depth: 11});
    layers.push({type: 'conv', sx: 3, filters: 64, stride: 1, activation: 'relu'});
    layers.push({type: 'pool', sx: 3, stride: 1});
    layers.push({type: 'fc', num_neurons: 1, activation: 'sigmoid'});

    net = new convnetjs.Net();
    net.makeLayers(layers);
    return net;
}

export function train() {
    let x = constructTrainingX();
    let y = constructTrainingY();
    let net = buildModel();
    let trainer = new convnetjs.Trainer(net, {method: 'sgd', learning_rate: 0.01, l2_decay: 0.001, momentum: 0.9, batch_size: 10, l1_decay: 0.001});
    for(let i=0; i < x.length; i++) {
        trainer.train(x[i], y[i]);
    }
    
    console.log("no er");
}

export function predict(text) {
    let v = constructTest(text)
    return net.forward(v);
}
