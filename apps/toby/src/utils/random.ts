
/**
 * Picks unique random numbers from a range [1, total], excluding specific numbers.
 * @param total Total number of students (range 1 to total)
 * @param count Number of items to pick
 * @param excludeList Array of numbers to exclude
 * @returns Array of picked numbers
 * @throws Error if not enough numbers to pick
 */
export const pickRandomNumbers = (
    total: number,
    count: number,
    excludeList: number[]
): number[] => {
    // Create a pool of available numbers
    const pool: number[] = [];
    for (let i = 1; i <= total; i++) {
        if (!excludeList.includes(i)) {
            pool.push(i);
        }
    }

    if (pool.length < count) {
        throw new Error('뽑을 수 있는 번호가 부족합니다.');
    }

    // Fisher-Yates shuffle variation
    const result: number[] = [];
    for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * pool.length);
        result.push(pool[randomIndex]);
        // Remove selected item from pool to ensure uniqueness
        pool.splice(randomIndex, 1);
    }

    return result;
};
