// Datos dummy para métodos de análisis, laboratorios y proyectos

export const mockData = {
  message: "Analysis methods retrieved successfully",
  data: [
    {
      id: 6,
      name: "ABA",
      matrixType: "Suelo",
      source: "Extraído de la base de datos del laboratorio ALS",
      laboratoryId: 2,
      createdAt: "2025-06-24T15:51:42.240Z",
      updatedAt: "2025-06-24T15:51:42.240Z",
      previousAnalysisCosts: [
        { projectId: 1, analysisCost: 145 },
        { projectId: 4, analysisCost: 938 },
        { projectId: 3, analysisCost: 536 },
        { projectId: 2, analysisCost: 91 },
        { projectId: 1, analysisCost: 688 },
        { projectId: 4, analysisCost: 855 },
        { projectId: 3, analysisCost: 318 },
        { projectId: 2, analysisCost: 171 }
      ],
      currentCost: 623
    },
    {
      id: 12,
      name: "Alcalinidad",
      matrixType: "Suelo",
      source: "Extraído de la base de datos del laboratorio SGS",
      laboratoryId: 1,
      createdAt: "2025-06-24T15:51:42.240Z",
      updatedAt: "2025-06-24T15:51:42.240Z",
      previousAnalysisCosts: [
        { projectId: 1, analysisCost: 302 },
        { projectId: 4, analysisCost: 871 },
        { projectId: 3, analysisCost: 796 },
        { projectId: 2, analysisCost: 481 },
        { projectId: 1, analysisCost: 432 },
        { projectId: 4, analysisCost: 511 },
        { projectId: 3, analysisCost: 800 },
        { projectId: 2, analysisCost: 642 },
        { projectId: 1, analysisCost: 561 },
        { projectId: 4, analysisCost: 874 },
        { projectId: 3, analysisCost: 387 },
        { projectId: 2, analysisCost: 244 },
        { projectId: 1, analysisCost: 840 },
        { projectId: 4, analysisCost: 139 },
        { projectId: 3, analysisCost: 233 },
        { projectId: 2, analysisCost: 360 },
        { projectId: 1, analysisCost: 699 },
        { projectId: 4, analysisCost: 546 },
        { projectId: 3, analysisCost: 564 },
        { projectId: 2, analysisCost: 748 },
        { projectId: 1, analysisCost: 600 },
        { projectId: 4, analysisCost: 544 },
        { projectId: 3, analysisCost: 110 },
        { projectId: 2, analysisCost: 380 },
        { projectId: 1, analysisCost: 59 },
        { projectId: 4, analysisCost: 858 },
        { projectId: 3, analysisCost: 286 }
      ],
      currentCost: 556
    },
    {
      id: 13,
      name: "Amoníaco y amonio",
      matrixType: "Agua",
      source: "Extraído de la base de datos del laboratorio ALS",
      laboratoryId: 4,
      createdAt: "2025-06-24T15:51:42.240Z",
      updatedAt: "2025-06-24T15:51:42.240Z",
      previousAnalysisCosts: [
        { projectId: 1, analysisCost: 170 },
        { projectId: 4, analysisCost: 913 },
        { projectId: 3, analysisCost: 398 },
        { projectId: 2, analysisCost: 685 },
        { projectId: 1, analysisCost: 670 },
        { projectId: 4, analysisCost: 478 },
        { projectId: 3, analysisCost: 393 },
        { projectId: 2, analysisCost: 945 },
        { projectId: 1, analysisCost: 310 },
        { projectId: 4, analysisCost: 829 },
        { projectId: 3, analysisCost: 51 },
        { projectId: 2, analysisCost: 936 }
      ],
      currentCost: 310
    },
    {
      id: 4,
      name: "COT",
      matrixType: "Suelo",
      source: "Extraído de la base de datos del laboratorio Hidrolab",
      laboratoryId: 4,
      createdAt: "2025-06-24T15:51:42.240Z",
      updatedAt: "2025-06-24T15:51:42.240Z",
      previousAnalysisCosts: [
        { projectId: 1, analysisCost: 623 },
        { projectId: 4, analysisCost: 577 },
        { projectId: 3, analysisCost: 478 },
        { projectId: 2, analysisCost: 439 }
      ],
      currentCost: 434
    },
    {
      id: 11,
      name: "Coliformes fecales",
      matrixType: "Agua",
      source: "Extraído de la base de datos del laboratorio ALS",
      laboratoryId: 1,
      createdAt: "2025-06-24T15:51:42.240Z",
      updatedAt: "2025-06-24T15:51:42.240Z",
      previousAnalysisCosts: [
        { projectId: 1, analysisCost: 464 },
        { projectId: 4, analysisCost: 416 },
        { projectId: 3, analysisCost: 368 },
        { projectId: 2, analysisCost: 966 },
        { projectId: 1, analysisCost: 386 },
        { projectId: 4, analysisCost: 960 },
        { projectId: 3, analysisCost: 905 },
        { projectId: 2, analysisCost: 98 },
        { projectId: 1, analysisCost: 111 },
        { projectId: 4, analysisCost: 833 },
        { projectId: 3, analysisCost: 318 },
        { projectId: 2, analysisCost: 349 },
        { projectId: 1, analysisCost: 353 },
        { projectId: 4, analysisCost: 50 },
        { projectId: 3, analysisCost: 19 },
        { projectId: 2, analysisCost: 242 },
        { projectId: 1, analysisCost: 60 },
        { projectId: 4, analysisCost: 697 },
        { projectId: 3, analysisCost: 113 },
        { projectId: 2, analysisCost: 989 },
        { projectId: 1, analysisCost: 29 },
        { projectId: 4, analysisCost: 800 },
        { projectId: 3, analysisCost: 249 },
        { projectId: 2, analysisCost: 409 }
      ],
      currentCost: 754
    },
    {
      id: 7,
      name: "Cr VI",
      matrixType: "Suelo",
      source: "Extraído de la base de datos del laboratorio AGS",
      laboratoryId: 4,
      createdAt: "2025-06-24T15:51:42.240Z",
      updatedAt: "2025-06-24T15:51:42.240Z",
      previousAnalysisCosts: [
        { projectId: 1, analysisCost: 156 },
        { projectId: 4, analysisCost: 813 },
        { projectId: 3, analysisCost: 53 },
        { projectId: 2, analysisCost: 241 },
        { projectId: 1, analysisCost: 906 },
        { projectId: 4, analysisCost: 55 },
        { projectId: 3, analysisCost: 806 },
        { projectId: 2, analysisCost: 419 }
      ],
      currentCost: 897
    },
    {
      id: 3,
      name: "Granulometría",
      matrixType: "Suelo",
      source: "Extraído de la base de datos del laboratorio AGS",
      laboratoryId: 4,
      createdAt: "2025-06-24T15:51:42.240Z",
      updatedAt: "2025-06-24T15:51:42.240Z",
      previousAnalysisCosts: [
        { projectId: 1, analysisCost: 622 },
        { projectId: 4, analysisCost: 545 },
        { projectId: 3, analysisCost: 569 },
        { projectId: 2, analysisCost: 193 }
      ],
      currentCost: 520
    },
    {
      id: 10,
      name: "Iones",
      matrixType: "Agua",
      source: "Extraído de la base de datos del laboratorio SGS",
      laboratoryId: 4,
      createdAt: "2025-06-24T15:51:42.240Z",
      updatedAt: "2025-06-24T15:51:42.240Z",
      previousAnalysisCosts: [
        { projectId: 1, analysisCost: 463 },
        { projectId: 4, analysisCost: 808 },
        { projectId: 3, analysisCost: 846 },
        { projectId: 2, analysisCost: 669 },
        { projectId: 1, analysisCost: 701 },
        { projectId: 4, analysisCost: 26 },
        { projectId: 3, analysisCost: 319 },
        { projectId: 2, analysisCost: 751 }
      ],
      currentCost: 469
    },
    {
      id: 1,
      name: "Metales",
      matrixType: "Agua",
      source: "Extraído de la base de datos del laboratorio SGS",
      laboratoryId: 3,
      createdAt: "2025-06-24T15:51:42.240Z",
      updatedAt: "2025-06-24T15:51:42.240Z",
      previousAnalysisCosts: [
        { projectId: 1, analysisCost: 675 },
        { projectId: 4, analysisCost: 331 },
        { projectId: 3, analysisCost: 827 },
        { projectId: 2, analysisCost: 440 }
      ],
      currentCost: 8
    },
    {
      id: 9,
      name: "PB",
      matrixType: "Agua",
      source: "Extraído de la base de datos del laboratorio ALS",
      laboratoryId: 1,
      createdAt: "2025-06-24T15:51:42.240Z",
      updatedAt: "2025-06-24T15:51:42.240Z",
      previousAnalysisCosts: [
        { projectId: 1, analysisCost: 71 },
        { projectId: 4, analysisCost: 922 },
        { projectId: 3, analysisCost: 484 },
        { projectId: 2, analysisCost: 499 },
        { projectId: 1, analysisCost: 640 },
        { projectId: 4, analysisCost: 795 },
        { projectId: 3, analysisCost: 556 },
        { projectId: 2, analysisCost: 312 }
      ],
      currentCost: 316
    },
    {
      id: 5,
      name: "SPLP",
      matrixType: "Agua",
      source: "Extraído de la base de datos del laboratorio AGS",
      laboratoryId: 4,
      createdAt: "2025-06-24T15:51:42.240Z",
      updatedAt: "2025-06-24T15:51:42.240Z",
      previousAnalysisCosts: [
        { projectId: 1, analysisCost: 989 },
        { projectId: 4, analysisCost: 91 },
        { projectId: 3, analysisCost: 214 },
        { projectId: 2, analysisCost: 125 },
        { projectId: 1, analysisCost: 169 },
        { projectId: 4, analysisCost: 37 },
        { projectId: 3, analysisCost: 950 },
        { projectId: 2, analysisCost: 616 },
        { projectId: 1, analysisCost: 315 },
        { projectId: 4, analysisCost: 579 },
        { projectId: 3, analysisCost: 289 },
        { projectId: 2, analysisCost: 360 },
        { projectId: 1, analysisCost: 831 },
        { projectId: 4, analysisCost: 260 },
        { projectId: 3, analysisCost: 774 },
        { projectId: 2, analysisCost: 165 },
        { projectId: 1, analysisCost: 236 },
        { projectId: 4, analysisCost: 820 },
        { projectId: 3, analysisCost: 572 },
        { projectId: 2, analysisCost: 986 },
        { projectId: 1, analysisCost: 636 },
        { projectId: 4, analysisCost: 193 },
        { projectId: 3, analysisCost: 602 },
        { projectId: 2, analysisCost: 882 },
        { projectId: 1, analysisCost: 177 },
        { projectId: 4, analysisCost: 242 },
        { projectId: 3, analysisCost: 344 },
        { projectId: 2, analysisCost: 149 }
      ],
      currentCost: 239
    },
    {
      id: 8,
      name: "TTRR/Rh",
      matrixType: "Agua",
      source: "Extraído de la base de datos del laboratorio AGS",
      laboratoryId: 3,
      createdAt: "2025-06-24T15:51:42.240Z",
      updatedAt: "2025-06-24T15:51:42.240Z",
      previousAnalysisCosts: [
        { projectId: 1, analysisCost: 73 },
        { projectId: 4, analysisCost: 599 },
        { projectId: 3, analysisCost: 202 },
        { projectId: 2, analysisCost: 774 },
        { projectId: 1, analysisCost: 373 },
        { projectId: 4, analysisCost: 94 },
        { projectId: 3, analysisCost: 358 },
        { projectId: 2, analysisCost: 338 },
        { projectId: 1, analysisCost: 987 },
        { projectId: 4, analysisCost: 633 },
        { projectId: 3, analysisCost: 831 },
        { projectId: 2, analysisCost: 905 },
        { projectId: 1, analysisCost: 956 },
        { projectId: 4, analysisCost: 576 },
        { projectId: 3, analysisCost: 352 },
        { projectId: 2, analysisCost: 291 }
      ],
      currentCost: 347
    },
    {
      id: 2,
      name: "pH/CE",
      matrixType: "Agua",
      source: "Extraído de la base de datos del laboratorio AGS",
      laboratoryId: 2,
      createdAt: "2025-06-24T15:51:42.240Z",
      updatedAt: "2025-06-24T15:51:42.240Z",
      previousAnalysisCosts: [
        { projectId: 1, analysisCost: 292 },
        { projectId: 4, analysisCost: 121 },
        { projectId: 3, analysisCost: 395 },
        { projectId: 2, analysisCost: 208 }
      ],
      currentCost: 565
    }
  ]
};

export const laboratoryIdToName = {
  1: "ALS",
  2: "SGS",
  3: "Hidrolab",
  4: "AGS"
};

export const projectIdToName = {
  1: "Proyecto Minero Norte",
  2: "Proyecto Agrícola Sur",
  3: "Proyecto Industrial Este",
  4: "Proyecto Residencial Oeste"
}; 