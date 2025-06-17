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
        label: "Mandola/Mandolin/Tenor Banjo",
        tuning: {
            4: "G",
            3: "D",
            2: "A",
            1: "E",
        },
    },
    {
        label: "Banjo Standard Plectrum",
        tuning: {
            4: "C",
            3: "G",
            2: "B",
            1: "D",
        },
    },
    {
        label: "Banjo Open G",
        tuning: {
            4: "D",
            3: "G",
            2: "B",
            1: "G",
        },
    },
    {
        label: "Banjo Double C",
        tuning: {
            4: "C",
            3: "G",
            2: "C",
            1: "D",
        },
    },
    {
        label: "Banjo C",
        tuning: {
            4: "C",
            3: "G",
            2: "B",
            1: "D",
        },
    },
    {
        label: "Banjo D",
        tuning: {
            4: "D",
            3: "F♯",
            2: "A",
            1: "D",
        },
    },
    {
        label: "Banjo G Modal",
        tuning: {
            4: "D",
            3: "G",
            2: "C",
            1: "D",
        },
    },
    {
        label: "Guitar Standard 7-string BEADGBE",
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
