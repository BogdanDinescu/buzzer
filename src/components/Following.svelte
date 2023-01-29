<script lang="ts">
    import { onMount } from 'svelte';
    import { gun } from '../gunDB';
    import { Paper, Button, Text, Grid} from '@svelteuidev/core';

    let users:{pub:string, alias:string}[] = [];
    const cardStyle = {
        width: "400px"
    }

    onMount(() => {
        gun.get("users").map().once((alias, pub) => {
            users = [...users, {pub, alias}]
        });
    });
</script>

{#each users as {pub, alias}}
    <Paper
        p='sm'
        withBorder
        override={cardStyle}
    >
    <Grid>
        <Grid.Col span={9}>
            <Text size='lg' weight='semibold'>
                {alias}
            </Text>

            <Text size='sm' color='gray'>
                {pub}
            </Text>
        </Grid.Col>

        <Grid.Col span={2}>
        <Button>
            Follow
        </Button>
        </Grid.Col>

    </Grid>
    </Paper>
{/each}
