SELECT Player, NFL_Team, Round, Ovr_Pick_No, Position, College, Notes
FROM draft
WHERE NFL_Team IN ('Pittsburgh Steelers')
ORDER BY Round asc;