export type TuningOption = {
    label: string;
    tuning: Record<number, string>;
};

export const tuningOptions: TuningOption[] = [
    {
        label: "Standard 6-string EADGBE",
        tuning: {
            6: "E",
            5: "A",
            4: "D",
            3: "G",
            2: "B",
            1: "E",
        },
    },
    {
        label: "Drop D (DADGBE)",
        tuning: {
            6: "D",
            5: "A",
            4: "D",
            3: "G",
            2: "B",
            1: "E",
        },
    },
    {
        label: "DADGAB",
        tuning: {
            6: "D",
            5: "A",
            4: "D",
            3: "G",
            2: "A",
            1: "B",
        },
    },
    {
        label: "Mandola/Mandolin",
        tuning: {
            4: "G",
            3: "D",
            2: "A",
            1: "E",
        },
    },
    {
        label: "Standard 7-string BEADGBE",
        tuning: {
            7: "B",
            6: "E",
            5: "A",
            4: "D",
            3: "G",
            2: "B",
            1: "E",
        },
    },
];
