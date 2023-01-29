import GUN from 'gun/gun'
import SEA from 'gun/sea'
//import 'gun/axe';
//import 'gun/lib/radix.js'
//import 'gun/lib/radisk.js'
//import 'gun/lib/store.js'

export const gun = GUN();

export const user = gun.user().recall({sessionStorage: true});

