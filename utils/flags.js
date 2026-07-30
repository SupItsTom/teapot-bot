export const UserFlags = Object.freeze({
    NONE: 0,

    // Bits 0-7: Core account permissions and states
    STAFF: 1 << 0,
    BUG_HUNTER: 1 << 1,
    BLACKLISTED: 1 << 2,
    QUARANTINED: 1 << 3,

    // Bits 16-30: Badges and decoration,
    BADGE_SUPERIORITY: 1 << 16,
    BADGE_UNICORN: 1 << 17,
});


export function hasFlag(flags, flag) {
    return (flags & flag) === flag;
}

export function getActiveFlags(flags) {
    return Object.entries(UserFlags)
        .filter(([_, value]) => value !== UserFlags.NONE && hasFlag(flags, value))
        .map(([key]) => key);
}