<script lang="ts">
    // @ts-nocheck
    import { Button, Space, TextInput, Text, Notification } from '@svelteuidev/core';
    import Gun from 'gun/gun';
    import { InfoCircled, LockClosed, Upload } from 'radix-icons-svelte';
    import { gun, sea } from '../gunDB';
    import { Post } from '../Post';

    let text: string = '';
    let photo: string = '';
    let password: string = '';
    let alert: string = ''; 
    let fileInput: any;
    export let closeModal: any;

    async function post(): Promise<void> {
        // get public key
        const timestamp: number = Gun.state();
        const pubKey = gun.user().is?.pub;
        let alias = gun.user().is?.alias.toString();
        if (alias === pubKey) {
            let aliasStorage = localStorage.getItem('alias');
            if (aliasStorage) {
                alias = aliasStorage;
            }
        }
        if (pubKey === undefined || alias === undefined) {
            displayAlert("User not logged in. Please logout and log back in")
            return;
        }

        // get private key
        const privKey = await getPrivKey(password);
        if (typeof privKey !== "string") {
            displayAlert(privKey.err)
            return;
        }

        // construct the post
        const post: Post = new Post(pubKey, alias, timestamp, text)

        if (photo) {
            post.photo = await getCID();
        }

        // sign the post
        const signedPostString = await getSignedPost(pubKey, privKey, post);
        if (typeof signedPostString !== "string") {
            displayAlert(signedPostString.err)
            return;
        }
        // save into posts
        gun.user().get("posts").set(signedPostString, (result) => {
            if ("err" in result && result.err !== undefined) {
                displayAlert("Cannot save post");
            } else {
                const hashtags = getHashTags(post.text);
                if (hashtags.length == 0) {
                    closeModal();
                }
                // save hashtag
                hashtags.forEach(hashtag => {
                    gun.get("hashtags").get(hashtag.substring(1)).set(signedPostString, (result) => {
                        if ("err" in result && result.err !== undefined) {
                            displayAlert("Cannot save hashtag");
                        } else {
                            closeModal();
                        }
                    });
                });
            }
        });
    }

    async function getSignedPost(pubKey: string, privKey: string, post: Post): Promise<string | {err: string}> {
        const signedText = await sea.sign(post, {priv: privKey, pub: pubKey});
        if (!signedText) {
            return {err: "Wrong password."};
        }
        return signedText;
    }

    async function getPrivKey(password: string): Promise<string | {err: string}> {
        const encryptedPrivKey = localStorage.getItem("encPrivKey");
        if (!encryptedPrivKey) {
            return {err: "User not logged in. Please logout and log back in"};
        }
        const privKey = await sea.decrypt(encryptedPrivKey, password);
        if (!privKey) {
            return {err: "Wrong password."};
        }
        return privKey;
    }

    function displayAlert(alertText: string): void {
        alert = alertText;
        setTimeout(() => alert = '', 3000);
    }

    function getHashTags(text: string): Array<string> {
        const re = /#\w+/g;
        const arr: string[] = [];
        const mathes = re.exec(text);
        mathes?.forEach(x => {
            arr.push(x);
        });
        return arr;
    }

    function closeAlert(): void {
        alert = '';
    }

    async function getCID() {
        const cid = await fetch('http://localhost:3000/', {
			method: 'POST',
			body: JSON.stringify({ payload: photo}),
			headers: {
				'Content-Type': 'application/json'
			}
		});
        const cidObj = await cid.json()
        return cidObj.cid;
    }

    $: if (fileInput) {
        const reader = new FileReader();
        reader.readAsDataURL(fileInput[0]);
        reader.addEventListener('load', async () => { photo = reader.result; });
	}
</script>

<textarea rows="5" maxlength="300" bind:value={text}></textarea>
<Space h="sm"/>
<label for="photo">
    <Text 
    size="sm"
>
    Image (optional)
</Text></label>
<input
	accept="image/png, image/jpeg"
	bind:files={fileInput}
	id="photo"
	name="photo"
	type="file"
/>
<Space h="md"/>
<TextInput
    placeholder="Password"
    icon={LockClosed}
    type={"password"}
    bind:value={password}
/>
<Space h="md"/>
<Text 
    align="center"
    color="orange"
    size="sm"
>
    Password is needed for signing the post with your private key.
</Text>
<Space h="sm"/>
{#if alert}
    <Notification icon={InfoCircled}  title="Error" color="orange" on:close={closeAlert}>
        {alert}
    </Notification>
    <Space h="sm"/>
{/if}
<Button
    color="orange"
    on:click={post}
    disabled={text.length == 0 || password.length == 0}
>
    Post
</Button>

<style>
    textarea {
        border: 2px lightgrey solid;
        border-radius: 5px;
        width: 100%;
        height: 200%;
    }
</style>