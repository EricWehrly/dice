# Trick Bag - Candidate Trick Ideas (Review Draft)

Purpose: Suggested additional tricks to expand the catalog beyond the current baseline. This is a review list, not committed scope.

Each candidate includes:
- Detection rule
- Suggested score metric (for per-trick high score)
- Achievability notes

---

## Stateless Candidates

## 1) Exact Pair

Detection:
- Exactly one pair and all remaining dice are non-matching.
- Example valid: 2,2,4,5
- Example invalid: 2,2,4,4 (two pairs)

Score metric:
- Pair face value (higher pair = better), tie-break by dice count participating.

Achievability:
- Requires at least 2 dice.

---

## 2) Two Pair

Detection:
- Exactly two distinct pairs.
- Example: 2,2,5,5

Score metric:
- Sum of pair face values.

Achievability:
- Requires at least 4 dice.

---

## 3) Full House

Detection:
- One triple + one pair.
- Example: 3,3,3,5,5

Score metric:
- Triple value first, then pair value as tie-break.

Achievability:
- Requires at least 5 dice.

---

## 4) Even Sweep

Detection:
- All active dice show even values.

Score metric:
- Number of participating dice.

Achievability:
- Any dice count >= 1.

---

## 5) Odd Sweep

Detection:
- All active dice show odd values.

Score metric:
- Number of participating dice.

Achievability:
- Any dice count >= 1.

---

## 6) Prime Distinct

Status:
- Promoted into baseline planned stateless tricks (TB-02).

Detection:
- All active dice are distinct and each value is in the game-prime set.
- Game-prime set intentionally includes 1.
- For d6 this means 1,2,3,5.
- A lone 1 on a 1d6 counts.

Score metric:
- Number of participating dice.

Achievability:
- Any dice count >= 1, but probability changes with face count upgrades.

---

## 7) Mirror Ends

Detection:
- At least one die on lowest face and at least one die on highest face in same roll.
- For d6: at least one 1 and one 6.

Score metric:
- Count of low/high endpoints present (maximizing endpoint multiplicity).

Achievability:
- Requires at least 2 dice.

---

## 8) No Repeats

Detection:
- All active dice show unique values (no duplicates).

Score metric:
- Number of unique values (equals participating dice count when fired).

Achievability:
- Limited by face count; not achievable if active dice > faceCount.

---

## 9) Tight Cluster

Detection:
- Max face - min face <= 1.
- All dice are the same value or adjacent values.

Score metric:
- Number of participating dice.

Achievability:
- Any dice count >= 1.

---

## 10) Wide Spread

Detection:
- Max face - min face >= threshold (e.g. 4 on d6).

Score metric:
- Spread width (`max-min`) then participating dice count.

Achievability:
- Depends on die face count and configured threshold.

---

## Stateful / Combo Candidates

## 11) Climber

Detection:
- Ascending trick achieved on consecutive rolls with strictly increasing ascending length.

Score metric:
- Maximum ascending length reached in-chain.

Achievability:
- Requires history and enough active dice.

---

## 12) Echo Pair

Detection:
- Same pair value appears in consecutive full rolls.
- Example: pair of 4s two rolls in a row.

Score metric:
- Streak length.

Achievability:
- Requires at least 2 dice and full-roll streak eligibility.

---

## 13) Momentum

Detection:
- Same trick fires in X consecutive full rolls.

Score metric:
- Streak length.

Achievability:
- Depends on base trick and full-roll policy.

---

## 14) Escalation

Detection:
- Of-a-kind count increases across consecutive rolls (2 -> 3 -> 4 ...).

Score metric:
- Highest count reached in one chain.

Achievability:
- Requires history and larger dice pools.

---

## 15) Perfect Repeat

Detection:
- Entire full-roll value list repeats exactly for N full rolls.

Score metric:
- Repeat chain length.

Achievability:
- Always possible in theory; probability drops sharply with dice count.

---

## Optional "Bridge" Tricks (if the 1d6 deadlock becomes painful)

These are intentionally simple and can be disabled later.

## B1) Lone Peak

Detection:
- Single active die rolls its max face.

Score metric:
- 1 (binary trick).

Use:
- Early bootstrapping only.

---

## B2) Lone Climb

Detection:
- Single active die rolls a value higher than its previous roll.

Score metric:
- Delta increase.

Use:
- Encourages play progression before multi-die tricks are available.

---

## Recommendation for first expansion batch

If you want a conservative next set after baseline tricks, start with:
- Exact Pair
- Two Pair
- Full House
- No Repeats
- Mirror Ends

These are easy to explain, easy to score, and work well with the existing trick/high-score model.
