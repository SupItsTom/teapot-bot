export const UserFlags = Object.freeze({
    NONE: 0,

    // Bits 0-7: Core account permissions and states
    BUG_HUNTER: 1 << 0,
    BLACKLISTED: 1 << 1,
    QUARANTINED: 1 << 2,

    // Bits 16-30: Badges and decoration
    BADGE_DEVELOPER: 1 << 16,
    BADGE_SUPERIORITY: 1 << 17,
    BADGE_UNICORN: 1 << 18,
});


export function hasFlag(flags, flag) {
    return (flags & flag) === flag;
}

export function getActiveFlags(flags) {
    return Object.entries(UserFlags)
        .filter(([_, value]) => value !== UserFlags.NONE && hasFlag(flags, value))
        .map(([key]) => key);
}