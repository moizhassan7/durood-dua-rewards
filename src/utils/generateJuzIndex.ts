/**
 * Utility to generate index.json files for Juz folders
 * This helps optimize PDF loading by providing a manifest of available pages
 */

import fs from 'fs';
import path from 'path';

interface PageData {
  filename: string;
  pageNumber: number;
}

interface JuzIndex {
  juzNumber: number;
  folderName: string;
  totalPages: number;
  pages: PageData[];
  generatedAt: string;
}

/**
 * Generates index.json for a specific Juz folder
 * @param juzFolderPath - Path to the Juz folder
 * @param juzNumber - Juz number (1-30)
 * @param folderName - Folder name (e.g., "Juz_01_Alif-laam-meem")
 */
export const generateJuzIndex = (
  juzFolderPath: string,
  juzNumber: number,
  folderName: string
): JuzIndex | null => {
  try {
    // Check if folder exists
    if (!fs.existsSync(juzFolderPath)) {
      console.warn(`Juz folder not found: ${juzFolderPath}`);
      return null;
    }

    // Read all PDF files in the folder
    const files = fs.readdirSync(juzFolderPath);
    const pdfFiles = files
      .filter(file => file.toLowerCase().endsWith('.pdf'))
      .sort((a, b) => {
        // Sort by page number extracted from filename
        const pageNumA = extractPageNumber(a);
        const pageNumB = extractPageNumber(b);
        return pageNumA - pageNumB;
      });

    // Generate page data
    const pages: PageData[] = pdfFiles.map((filename, index) => ({
      filename,
      pageNumber: index + 1
    }));

    const indexData: JuzIndex = {
      juzNumber,
      folderName,
      totalPages: pages.length,
      pages,
      generatedAt: new Date().toISOString()
    };

    // Write index.json to the folder
    const indexPath = path.join(juzFolderPath, 'index.json');
    fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2));
    
    console.log(`Generated index.json for ${folderName}: ${pages.length} pages`);
    return indexData;

  } catch (error) {
    console.error(`Error generating index for ${folderName}:`, error);
    return null;
  }
};

/**
 * Extracts page number from filename
 * Handles patterns like: Page_0006_Juz_01_P_01.pdf, Page_0001.pdf, etc.
 */
const extractPageNumber = (filename: string): number => {
  // Try to extract number from patterns like Page_0006_Juz_01_P_01.pdf
  const match = filename.match(/Page_(\d+)/);
  if (match) {
    return parseInt(match[1], 10);
  }
  
  // Fallback: extract any number from filename
  const numberMatch = filename.match(/(\d+)/);
  return numberMatch ? parseInt(numberMatch[1], 10) : 0;
};

/**
 * Generates index.json files for all Juz folders
 * @param basePath - Base path to Juz_Split_Output folder
 */
export const generateAllJuzIndexes = (basePath: string) => {
  const juzData = [
    { number: 1, folder: "Juz_01_Alif-laam-meem" },
    { number: 2, folder: "Juz_02_Sayaqoolu" },
    { number: 3, folder: "Juz_03_Tilka-ar-rusul" },
    { number: 4, folder: "Juz_04_Lan-Tanaaloo" },
    { number: 5, folder: "Juz_05_Wal-Muhsanatu" },
    { number: 6, folder: "Juz_06_La-Yuhibbu-Allah" },
    { number: 7, folder: "Juz_07_Wa-Idha-Samiu" },
    { number: 8, folder: "Juz_08_Wa-Law-Annana" },
    { number: 9, folder: "Juz_09_Qal-al-Malau" },
    { number: 10, folder: "Juz_10_Wa-Aalamu" },
    { number: 11, folder: "Juz_11_Ya-tadhiruna" },
    { number: 12, folder: "Juz_12_Wa-Ma-Min-Dabbatin" },
    { number: 13, folder: "Juz_13_Wa-Ma-Ubarriu" },
    { number: 14, folder: "Juz_14_Rubama" },
    { number: 15, folder: "Juz_15_Subhana-Alladhi" },
    { number: 16, folder: "Juz_16_Qala-Alam" },
    { number: 17, folder: "Juz_17_Iqtarabat" },
    { number: 18, folder: "Juz_18_Qad-Aflaha" },
    { number: 19, folder: "Juz_19_Wa-Qala-Alladhina" },
    { number: 20, folder: "Juz_20_Amman-Khalaqa" },
    { number: 21, folder: "Juz_21_Utlu-Ma-Uhiya" },
    { number: 22, folder: "Juz_22_Wa-Man-Yaqnut" },
    { number: 23, folder: "Juz_23_Wa-Ma-Li" },
    { number: 24, folder: "Juz_24_Faman-Azlamu" },
    { number: 25, folder: "Juz_25_Ilayhi-Yuraddu" },
    { number: 26, folder: "Juz_26_Ha-Meem" },
    { number: 27, folder: "Juz_27_Qala-Fa-Ma-Khatbukum" },
    { number: 28, folder: "Juz_28_Qad-Samia-Allah" },
    { number: 29, folder: "Juz_29_Tabaraka-Alladhi" },
    { number: 30, folder: "Juz_30_Amma-Yatasaalun" }
  ];

  const results = [];
  
  for (const juz of juzData) {
    const juzPath = path.join(basePath, juz.folder);
    const result = generateJuzIndex(juzPath, juz.number, juz.folder);
    if (result) {
      results.push(result);
    }
  }
  
  console.log(`Generated ${results.length} index files`);
  return results;
};

/**
 * CLI script to generate all indexes
 * Run with: npx ts-node src/utils/generateJuzIndex.ts
 */
if (require.main === module) {
  const basePath = path.join(__dirname, '../data/Juz_Split_Output');
  generateAllJuzIndexes(basePath);
}
