<script lang="ts">
    import { gun } from '../gunDB';
    import { Tabs, Button, Modal } from '@svelteuidev/core';
    import { Home, Gear, Person, Pencil1 } from 'radix-icons-svelte';
    import { goto } from '$app/navigation';
    import NewPost from '../components/NewPost.svelte';
    import Following from '../components/Following.svelte';
    import Settings from '../components/Settings.svelte';
    import HomeComponent from '../components/HomeComponent.svelte';
    
    let openedModal = false;

    function openModal() {
        openedModal = true;
    }

    function closeModal() {
        openedModal = false;
    }

</script>

<Tabs color="orange" tabPadding="md">
    <Tabs.Tab label='Home' icon={Home}><HomeComponent/></Tabs.Tab>
    <Tabs.Tab label='Following' icon={Person}><Following/></Tabs.Tab>
    <Tabs.Tab label='Settings' icon={Gear}><Settings/></Tabs.Tab>
</Tabs>
<div class="floating">
    <Button
        color="orange"
        size="lg"
        compact
        on:click={openModal}>
        <Pencil1 slot='leftIcon'/>
        Buzz
    </Button>
</div>

<Modal opened={openedModal} on:close={closeModal} size="md" centered title="New post">
    <NewPost closeModal={closeModal} />
</Modal>


<style>
    .floating {
        position: absolute;
        bottom: 20px;
        right: 20px;
    }

</style>
