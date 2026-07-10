"""
Confidence scoring for Smart Add parser.
"""


def compute_confidence(
    has_date: bool,
    has_time: bool,
    has_duration: bool,
    has_title: bool,
    date_warnings: list,
    time_warnings: list,
    duration_warnings: list,
    category_warnings: list,
    priority_warnings: list,
    title_warnings: list,
) -> tuple[float, list[str]]:
    """
    Compute overall confidence score for parsed event.
    
    Returns: (confidence_score, all_warnings)
    
    Score breakdown:
    - 0.4: Has date
    - 0.3: Has time
    - 0.2: Has title
    - 0.1: Has duration
    
    Penalty for each warning: -0.05
    
    Final score is clamped to [0.0, 1.0].
    """
    score = 0.0
    all_warnings = []
    
    # Collect all warnings
    all_warnings.extend(date_warnings)
    all_warnings.extend(time_warnings)
    all_warnings.extend(duration_warnings)
    all_warnings.extend(category_warnings)
    all_warnings.extend(priority_warnings)
    all_warnings.extend(title_warnings)
    
    # Award points for parsed components
    if has_date:
        score += 0.4
    
    if has_time:
        score += 0.3
    
    if has_title:
        score += 0.2
    
    if has_duration:
        score += 0.1
    
    # Penalty for warnings
    warning_penalty = len(all_warnings) * 0.05
    score -= warning_penalty
    
    # Clamp to [0, 1]
    score = max(0.0, min(1.0, score))
    
    # Round to 2 decimals
    score = round(score, 2)
    
    return score, all_warnings
