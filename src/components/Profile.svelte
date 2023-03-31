<script lang="ts">
    import { goto } from "$app/navigation";
    import { Button, Group, Notification, Title, Loader, Space, UnstyledButton } from "@svelteuidev/core";
    import { onMount } from "svelte";
    import { gun } from "../gunDB";
    
    let text: string = '';
    let notification: string = '';
    let notificationSuccess: boolean = false;
    let loading: boolean = false;

    onMount(() => {
        gun.user().get("profile").once((value) => {
            text = value;
        });
    })

    function update() {
        loading = true;
        gun.user().get("profile").put(text, (result) => {
            loading = false;
            if ("err" in result && result.err !== undefined) {
                notificationSuccess = false;
                displayNotification(result.err);
            }
            if ("ok" in result && result.ok !== undefined) {
                notificationSuccess = true;
                displayNotification("Update profile success!");
            }
        })
    }

    function displayNotification(alertText: string): void {
        notification = alertText;
        setTimeout(() => notification = '', 3000);
    }

    function closeNotification() {
        notification = '';
    }

    function clickTitle() {
        goto('/user/' + gun.user().is?.pub);
    }

</script>

<Group direction="column">
    <UnstyledButton root="a" on:click={clickTitle}><Title>My profile</Title></UnstyledButton>
    <textarea rows="5" maxlength="300" bind:value={text}></textarea>
    <Button 
        color="orange"
        on:click={update}
    >
        Update
        {#if loading}<Loader variant='dots' color='white' size='sm'/>{/if}
    </Button> 
</Group>

{#if notification}
    <Space h={10}/>
    <Notification title={notificationSuccess?"Success":"Error"} color="orange" on:close={closeNotification}>
        {notification}
    </Notification>
{/if}



<style>
    textarea {
        width: 80%;
        height: 200%;
    }
</style>