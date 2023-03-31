<script lang="ts">
    import { Paper, Title, Space, Text, ThemeIcon, Group, UnstyledButton} from "@svelteuidev/core";
    import type { Post } from '../Post';
    import { Check, Cross2 } from 'radix-icons-svelte';
    import { goto } from '$app/navigation';

    const cardStyle = {
        width: "500px"
    }
    const textStyle = {
        overflowWrap: "break-word"
    }
    export let post: Post;
    export let signingError: boolean = false;

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

</script>

<Paper
    p='sm'
    override={cardStyle}
>
    <UnstyledButton root="a" on:click={clickAlias}><Title size='lg' weight="semibold">{post.alias}</Title></UnstyledButton>
    <Space h={5}/>
    <Text size='xs' color='gray' override={textStyle}>{post.pub}</Text>
    <Space h={10}/>
    <Text override={textStyle}>{post.text}</Text>
    <Space h={10}/>
    <Group position="apart">
        <Text size='sm' color='gray'>{timestampToDate(post.timestamp)}</Text>
        {#if signingError}
            <ThemeIcon color="red" variant="subtle">
                <Cross2 />
            </ThemeIcon>
        {:else}
            <ThemeIcon color="green" variant="subtle">
                <Check />
            </ThemeIcon>
        {/if}
    </Group>
</Paper>