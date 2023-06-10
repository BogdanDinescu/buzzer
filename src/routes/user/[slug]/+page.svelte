<script lang="ts">
    import { gun, sea } from '../../../gunDB';
    import { page } from '$app/stores';
    import { Stack, Group, Title, Button, Loader, TextInput, Grid, Text } from '@svelteuidev/core';
    import { onMount } from 'svelte';
    import type { Post } from '../../../Post';
    import PostComponent from '../../../components/PostComponent.svelte';
    import { afterNavigate, goto } from '$app/navigation';
    import { ArrowLeft } from 'radix-icons-svelte';
    
    let pub = $page.params.slug;
    let previousPage: any;
    let alias: string;
    let petname: string;
    let posts: Array<Post> = [];
    let profile: string = '';
    let following: boolean = false;
    let loadingFollow: boolean = false;
    let followingArray: Array<any> = []

    onMount(() => {
        gun.user(pub).get("posts").map().once(async (value) => {
            const post = JSON.parse(value.substring(3));
            const verifiedPost: Post = await sea.verify(value, post.m.pub);
            if (verifiedPost) {
                posts = [...posts, verifiedPost];
            } else {
                const unverifiedPost = post.m;
                unverifiedPost.signingError = true;
                posts = [...posts, unverifiedPost];
            }
        })
        gun.user(pub).get("profile").once((value) => {
            if (value) {
                profile = value;
            }
        });
        gun.user(pub).get("alias").once((value) => {
            alias = value;
        });
        gun.user().get("following").once(async (value) => {
            followingArray = await decrypt(value);
            followingArray.forEach(pair => {
                if (pub === pair.pub && pair.alias) {
                    following = true;
                    alias = pair.alias
                }
            });
        })
    })

    afterNavigate(({from}) => {
        previousPage = from?.url.pathname;
    })

    async function follow(): Promise<void> {
        loadingFollow = true;
        if (petname.length === 0) {
            petname = alias;
        }
        followingArray.push({pub: pub, alias: petname})
        const enc = await encrypt(JSON.stringify(followingArray));
        gun.user().get("following").put(enc, (result) => {
            loadingFollow = false;
            following = true;
            alias = petname;
            if ("err" in result && result.err !== undefined) {
                console.log(result.err);
            }
        });
    }

    async function unfollow(): Promise<void> {
        loadingFollow = true;
        followingArray = followingArray.filter((item) => item.pub !== pub);
        const enc = await encrypt(JSON.stringify(followingArray));
        gun.user().get("following").put(enc, (result) => {
            loadingFollow = false;
            following = false;
            if ("err" in result && result.err !== undefined) {
                console.log(result.err);
            }
        });
    }

    async function encrypt(str: string): Promise<string> {
        const pairString = sessionStorage.getItem('pair')
        if (pairString) {
            const pair = JSON.parse(pairString);
            const encrypted = await sea.encrypt(str, pair);
            return encrypted;
        }
        return str;
    }

    async function decrypt(str: string): Promise<any> {
        if (str === null || str === undefined) {
            return [];
        }
        const pairString = sessionStorage.getItem('pair')
        if (pairString) {
            const pair = JSON.parse(pairString);
            const decrypted = await sea.decrypt(str, pair);
            return decrypted;
        }
        return str;
    }

</script>

<Stack>
<Grid>
    <Grid.Col span={2}><Button color="orange" size="xs" on:click={() => previousPage ? goto(previousPage) : goto('/')}><ArrowLeft/></Button></Grid.Col>
    <Grid.Col span={8}><Title align="center">{alias}</Title></Grid.Col>
    <Grid.Col span={2}>
        {#if following}
            <Button color="red" on:click={unfollow}>Unfollow {#if loadingFollow}<Loader variant='dots' color='white' size='sm'/>{/if}</Button>
        {:else}
            <Button color="orange" on:click={follow}>Follow {#if loadingFollow}<Loader variant='dots' color='white' size='sm'/>{/if}</Button>
        {/if}
    </Grid.Col>
</Grid>
<TextInput
    placeholder="Name"
    bind:value={petname}
/>
<Text root="p">{profile}</Text>
<Group position="center" direction="column">
    {#each posts as post}
        <PostComponent post = {post} signingError={"signingError" in post} customAlias={alias}/>
    {/each}
</Group>
</Stack>