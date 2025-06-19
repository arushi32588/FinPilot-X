def detect_drift(target_alloc, current_alloc, threshold=0.15):
    """
    Compares current allocation with target, returns list of drifted funds.
    """
    drifted = []

    for fund in target_alloc:
        if fund not in current_alloc:
            continue
        diff = abs(target_alloc[fund] - current_alloc[fund])
        if diff > threshold:
            drifted.append((fund, diff))

    return drifted
