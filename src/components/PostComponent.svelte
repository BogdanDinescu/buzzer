<script lang="ts">
    import { Paper, Title, Space, Text} from "@svelteuidev/core";
    import type { Post } from '../Post';

    const textStyle = {
        overflowWrap: "break-word"
    }
    export let post: Post;

</script>

<Paper
    p='sm'
>
    <Title size='lg' weight="semibold">{post.alias}</Title>
    <Space h={5}/>
    <Text size='xs' color='gray' override={textStyle}>{post.pub}</Text>
    <Space h={10}/>
    <Text override={textStyle}>{post.text}</Text>
    <Space h={10}/>
    <Text size='sm' color='gray'>{new Date(post.timestamp).toLocaleString()}</Text>
</Paper>