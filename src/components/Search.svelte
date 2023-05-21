<script lang="ts">
    import { TextInput, UnstyledButton, Text, Paper, Title, Grid, Space, Button, Group} from "@svelteuidev/core";
    import { MagnifyingGlass, ArrowLeft } from "radix-icons-svelte";
    import { onMount } from "svelte";
    import { gun, sea } from '../gunDB';
    import type { Post } from "../Post";
    import PostComponent from "./PostComponent.svelte";

    let search = ''
    let selectedHashtag = ''
    let hashtags: Array<string> = [];
    let searchedHashtags:  Array<string> = [];
    let selectedPosts: Array<Post> = [];

    onMount(() => {
        gun.get("hashtags").map().once((value, key) => {
            hashtags = [...hashtags, key];
            searchedHashtags = [...searchedHashtags, '#' + key];
        });
    })

    function searching() {
        if (search.length == 0) {
            searchedHashtags = [...hashtags].map(s => '#' + s);
        } else {
            searchedHashtags = hashtags.filter(s => s.includes(search)).map(s => '#' + s);
        }
    }

    function selecting() {
        selectedPosts = [];
        gun.get("hashtags").get(selectedHashtag.substring(1)).map().once(async (value, key) => {
            const post = JSON.parse(value.substring(3));
            const verifiedPost: Post = await sea.verify(value, post.m.pub);
            if (verifiedPost) {
                selectedPosts = [...selectedPosts, verifiedPost];
            } else {
                const unverifiedPost = post.m;
                unverifiedPost.signingError = true;
                selectedPosts = [...selectedPosts, unverifiedPost];
            }
        });
    }

</script>

{#if selectedHashtag}
    <Space h="sm"/>
    <Grid>
        <Grid.Col span={1}><Button color="orange" size="xs" on:click={() => selectedHashtag=''}><ArrowLeft/></Button></Grid.Col>
        <Grid.Col span={10}><Title align="center">{selectedHashtag}</Title></Grid.Col>
    </Grid>
    <Space h="sm"/>
    <Group position="center" direction="column">
        {#each selectedPosts as post}
            <PostComponent post = {post} signingError={"signingError" in post}/>
        {/each}
    </Group>
{:else}
    <TextInput
        placeholder="Search hashtags"
        icon={MagnifyingGlass}
        radius="md"
        bind:value={search}
        on:keyup={searching}
    />
    {#each searchedHashtags as hashtag}
        <UnstyledButton
            color="orange"
            root="div"
            on:click={() => {
                selectedHashtag = hashtag;
                selecting();
            }}
        >
            <Paper withBorder>
                <Text align="center">{hashtag}</Text>
            </Paper>
        </UnstyledButton>
    {/each}
{/if}