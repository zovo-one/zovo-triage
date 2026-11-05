function mergeSignals(...signals) {
    const adjusted = signals
        .filter(Boolean)
        .map(signal => signal instanceof AbortSignal
        ? signal
        : signal.signal);
    if (adjusted.length === 1) {
        return adjusted[0];
    }
    return AbortSignal.any(adjusted);
}

export { mergeSignals };
