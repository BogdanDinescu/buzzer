<script lang="ts">
    import { Paper, Title, Space, Text, ThemeIcon, Group, UnstyledButton, Tooltip, ActionIcon} from "@svelteuidev/core";
    import type { Post } from '../Post';
    import { Check, Cross2, MinusCircled, PlusCircled } from 'radix-icons-svelte';
    import { goto } from '$app/navigation';
    import { onMount } from "svelte";

    const cardStyle = {
        width: "500px"
    }
    const textStyle = {
        overflowWrap: "break-word"
    }
    export let post: Post;
    export let signingError: boolean = false;
    export let customAlias: string = "";
    let photo: string = "";

    onMount(async () => {
        if (post.photo) {
            const image = await fetch('http://localhost:3000/' + post.photo, {
                method: 'GET',
            });
            const photoObj = await image.json();
            photo = photoObj.text
        }
    });

    function clickAlias() {
        goto('/user/' + post.pub);
    }

    function timestampToDate(timestamp: number): string {
        const dtFormat = new Intl.DateTimeFormat('en-GB', {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
        return dtFormat.format(new Date(timestamp));
    }

    function vote(like: number): void {
        let votes: Array<any> = JSON.parse(localStorage.getItem("votes") || "[]");
        votes.push({text: post.text, like: like});
        if (votes.length > 10) {
            votes.shift();
        }
        localStorage.setItem("votes", JSON.stringify(votes));
    }

</script>

<Paper
    p='sm'
    override={cardStyle}
    withBorder
>
    <UnstyledButton root="a" on:click={clickAlias} override={textStyle}><Title size='lg' weight="semibold">{customAlias?customAlias:post.alias}</Title></UnstyledButton>
    <Space h={5}/>
    <Text size='xs' color='gray' override={textStyle}>{post.pub}</Text>
    <Space h={10}/>
    <Text override={textStyle}>{post.text}</Text>
    {#if photo}
        <img src={photo} width="100%" alt="missing img"/>
    {/if}
    <Space h={10}/>
    <Group position="apart">
        <Text size='sm' color='gray'>{timestampToDate(post.timestamp)}</Text>
        <Tooltip label="More like this text">
            <ActionIcon size="md" variant="transparent" on:click={() => vote(1)}><PlusCircled/></ActionIcon>
        </Tooltip>
        <Tooltip label="Less like this text">
            <ActionIcon size="md" variant="transparent" on:click={() => vote(0)}><MinusCircled/></ActionIcon>
        </Tooltip>
        
        {#if signingError}
            <ThemeIcon color="red" variant="subtle">
                <Cross2 />
            </ThemeIcon>
        {:else}
            <Tooltip label="Verified signature">
                <ThemeIcon color="green" variant="subtle">
                    <Check  />
                </ThemeIcon>
            </Tooltip>
        {/if}
    </Group>
</Paper>