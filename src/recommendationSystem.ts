// @ts-nocheck
import wink from 'wink-nlp';
import model from 'wink-eng-lite-web-model';
import convnetjs from 'convnetjs';
import wd from 'wink-distance';
const { bow } = wd;
import prepare from 'wink-nlp-utils';
const { tokens } = prepare;

var data = []
var docs = []
var net;
var vocab = []

function constructTensor(doc) {
    let m = [];
    let tokens = doc.tokens().out();
    for (let i = 0; i < 500; i++) {
        if (i < tokens.length) {
            if (tokens.includes(vocab[i])) {
                m.push(1);
            }
        }
        m.push(0);
    }
    return new convnetjs.Vol(m);
}



function constructTrainingX() {
    var data = JSON.parse(localStorage.getItem("votes") || "[]");
    let response = [];
    let winkModel = wink(model);
    let corpus = "";
    for (let i = 0; i < data.length; i++) {
        corpus = corpus + data[i].text;
    }
    let doc = winkModel.readDoc(corpus);
    let bow = tokens.bow(tokens.removeWords(doc.tokens().out()));
    bow = Object.entries(bow).map(( [k, v] ) => ({ word: k, number: v }));
    bow.sort((a, b) => b.number - a.number);
    bow = bow.slice(13, 513)
    vocab = bow.map(x => x.word);
    console.log(vocab)

    for (let i = 0; i < data.length; i++) {
        response.push(constructTensor(winkModel.readDoc(data[i].text)))
    }
    
    return response;
}

function constructTest(text) {
    let doc = wink(model).readDoc(text)
    return constructTensor(doc);
}

function constructTrainingY() {
    let response = []
    for (let i = 0; i < data.length; i++) {
        response.push(data[i].like);
    }
    return response;
}

function buildModel() {
    let layers = [];
    layers.push({type: 'input', out_sx: 1, out_sy: 1, out_depth: 500});
    layers.push({type: 'conv', sx: 3, filters: 64, stride: 1, activation: 'relu'});
    layers.push({type: 'pool', sx: 2, stride: 1});
    layers.push({type: 'fc', num_neurons: 512, activation: 'relu'});
    layers.push({type: 'fc', num_neurons: 1, activation: 'sigmoid'});

    net = new convnetjs.Net();
    net.makeLayers(layers);
    return net;
}

export function train() {
    let x = constructTrainingX();
    let y = constructTrainingY();
    let net = buildModel();
    let trainer = new convnetjs.Trainer(net, {method: 'adadelta', l2_decay: 0.001, batch_size: 10});
    for(let i=0; i < x.length; i++) {
        trainer.train(x[i], y[i]);
    }
    console.log("no er");
}

export function predict(text) {
    let v = constructTest(text)
    return net.forward(v);
}
