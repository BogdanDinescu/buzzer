<script lang="ts">
    // @ts-nocheck
    import { Button, Space, TextInput, Text, Alert } from '@svelteuidev/core';
    import Gun from 'gun/gun';
    import { InfoCircled, LockClosed } from 'radix-icons-svelte';
    import { gun, sea } from '../gunDB';

    let text: string = '';
    let password: string = '';
    let alert: string = ''; 
    export let closeModal: any;

    async function post() {
        const index: number = Gun.state();
        const pubKey = gun.user().is?.pub;
        if (pubKey === undefined) {
            displayAlert("User not logged in. Please logout and log back in")
            return;
        }
        const data = await getSignedText(pubKey);
        if (typeof data !== "string") {
            displayAlert(data.err)
            return;
        }
        gun.get(pubKey).get("posts").get(index.toString()).put(data, (result) => {
            if ("err" in result) {
                displayAlert(result.err);
            } else {
                closeModal();
            }
        });
    }

    async function getSignedText(pubKey: string): Promise<string | {err: string}> {
        const encryptedPrivKey = localStorage.getItem("encPrivKey");
        if (!encryptedPrivKey) {
            return {err: "User not logged in. Please logout and log back in"};
        }
        const privKey = await sea.decrypt(encryptedPrivKey, password);
        if (!privKey) {
            return {err: "Wrong password."};
        }
        const signedText = await sea.sign(text, {priv: privKey, pub: pubKey});
        if (!signedText) {
            return {err: "Wrong password."};
        }
        return signedText;
    }

    function displayAlert(alertText: string): void {
        alert = alertText;
        setTimeout(() => alert = '', 3000);
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
    <Alert icon={InfoCircled}  title="Error" color="orange">
        {alert}
    </Alert>
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
>
    Post
</Button>

<style>
    textarea {
        width: 100%;
        height: 200%;
    }
</style>