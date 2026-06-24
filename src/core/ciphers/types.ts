// A cipher transform takes runic text and returns runic text. Non-runes pass through.
export type RuneTransform = (text: string) => string
