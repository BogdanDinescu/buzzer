<script lang="ts">
    // @ts-nocheck
    import { Button, Space, TextInput, Text, Notification } from '@svelteuidev/core';
    import Gun from 'gun/gun';
    import { InfoCircled, LockClosed } from 'radix-icons-svelte';
    import { gun, sea } from '../gunDB';
    import { Post } from '../Post';

    let text: string = '';
    let password: string = '';
    let alert: string = ''; 
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

</script>

<textarea rows="5" maxlength="300" bind:value={text}></textarea>
<Space h="sm"/>
<Text 
    align="center"
    color="orange"
    size="sm"
>
    Password is needed for signing the post with your private key.
</Text>
{#if alert}
    <Space h="sm"/>
    <Notification icon={InfoCircled}  title="Error" color="orange" on:close={closeAlert}>
        {alert}
    </Notification>
{/if}
<Space h="sm"/>
<TextInput
    placeholder="Password"
    icon={LockClosed}
    type={"password"}
    bind:value={password}
/>
<Space h="md"/>
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