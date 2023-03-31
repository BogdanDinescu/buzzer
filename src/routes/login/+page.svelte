<script>
// @ts-nocheck
    import { TextInput, Button, Alert, Title, Loader } from '@svelteuidev/core';
    import { Person, LockClosed, InfoCircled, CheckCircled } from 'radix-icons-svelte';
    import { gun } from '../../gunDB';
    import { sea } from '../../gunDB';
    import { goto } from '$app/navigation';

    let username = '';
    let password = '';
    let alert = '';
    let success = false;
    let loadingRegister = false;
    let loadingLogin = false;

    function login() {
        loadingLogin = true;
        gun.user().auth(username, password, async (result) => {
            const encryptedPrivKey = await sea.encrypt(result.sea.priv, password);
            localStorage.setItem("encPrivKey", encryptedPrivKey);
            localStorage.setItem("alias", username);
            loadingLogin = false;
            if (result.err) {
                alert = result.err;
                success = false;
            } else {
                goto('/', {replaceState: true});
            }
        });
    }

    function register() {
        loadingRegister = true;
        gun.user().create(username, password, (result) => {
            loadingRegister = false;
            if (result.err) {
                alert = result.err;
                success = false;
            } else {
                success = true;
            }
        })
    }

</script>

<div class="form-container">
    <Title>Login</Title>
    {#if alert}
    <Alert icon={InfoCircled}  title="Error" color="orange">
        {alert}
    </Alert>
    {/if}
    {#if success}
    <Alert icon={CheckCircled}  title="Success" color="green">
        Registration succeded
    </Alert>
    {/if}
    <TextInput
    placeholder="Username"
    label="Username"
    icon={Person}
    bind:value={username}
    />
    <TextInput
    placeholder="Password"
    label="Password"
    icon={LockClosed}
    type={"password"}
    bind:value={password}
    />
    <div class="buttons">
        <Button
            color="orange"
            size="md" 
            ripple
            on:click={login}>
            Login
            {#if loadingLogin}<Loader variant='dots' color='white' size='sm'/>{/if}
        </Button>
        <Button
            color="orange"
            size="md"
            ripple
            on:click={register}>
            Register
            {#if loadingRegister}<Loader variant='dots' color='white' size='sm'/>{/if}
        </Button>
    </div>
</div>

<style>
.form-container {
    width: 400px;
}
.buttons {
    margin: 10px;
    display: flex ;
    flex-direction: row;
    justify-content: space-evenly;
}
</style>