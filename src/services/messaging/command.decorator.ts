export let commands = {};

/**
 * Adds @command({ command: 'discord command' }) decorator
 */
export function command(options: { command: string }) {
    return function (
        target: Object,
        key: string | symbol,
        descriptor: PropertyDescriptor
    ) {
        commands[options.command] = descriptor.value;
    };
}
