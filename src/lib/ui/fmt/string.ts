export function snake_to_capitalize(snake: string): string {
    return snake.split('_').map((x: string) => `${x[0].toLocaleUpperCase()}${x.slice(1)}`).join(' ')
}