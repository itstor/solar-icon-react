import fs from "fs/promises";
import path from "path";
import { ElementNode, parse } from "svg-parser";
import { fileURLToPath } from "url";
import { IconTree } from "../src/lib/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ICONS_DIR = path.join(__dirname, "..", "icons", "SVG");
const OUTPUT_DIR = path.join(__dirname, "..", "src");

const CATEGORY_ABBREVIATIONS: Record<string, string> = {
  Bold: "Bo",
  "Bold Duotone": "Bd",
  Broken: "Br",
  "Line Duotone": "Ld",
  Linear: "Li",
  Outline: "Ol",
};

interface IconData {
  name: string;
  category: string;
  content: string;
}

function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, "");
}

function pascalCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
    .replace(/\s+/g, "");
}

function camelCase(str: string): string {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

function convertToIconTree(
  node: ElementNode,
  category: string,
  isRoot = true
): IconTree {
  if (typeof node === "string") {
    return {
      tag: "",
      attr: {},
      child: [],
    };
  }

  const attr = node.properties
    ? Object.fromEntries(
        Object.entries(node.properties).map(([key, value]) => [
          camelCase(key),
          String(value),
        ])
      )
    : {};

  if (attr.stroke && attr.stroke != "none") attr.stroke = "currentColor";
  if (attr.fill && attr.fill != "none") attr.fill = "currentColor";

  if (attr.strokeLinecap) attr.strokeLinecap = attr.strokeLinecap;
  if (attr.strokeLinejoin) attr.strokeLinejoin = attr.strokeLinejoin;
  if (attr.fillRule) attr.fillRule = attr.fillRule;
  if (attr.clipRule) attr.clipRule = attr.clipRule;

  const children = (node.children || [])
    .filter((child): child is ElementNode => typeof child !== "string")
    .map((child) => convertToIconTree(child, category, false));

  if (category === "Linear") {
    if (isRoot && node.tagName === "svg") {
      attr.strokeWidth = "1.5";
    } else {
      delete attr.strokeWidth;
    }
  }

  return {
    tag: node.tagName || "",
    attr,
    child: children,
  };
}

function svgToIconTree(svgContent: string, category: string): IconTree {
  const parsed = parse(svgContent);
  const svgNode = parsed.children[0] as ElementNode;

  return convertToIconTree(svgNode, category, true);
}

function generateIconComponent(
  baseName: string,
  icon: IconData,
  suffix: number = 0
): string {
  const componentName = `${CATEGORY_ABBREVIATIONS[icon.category]}${baseName}${
    suffix > 1 ? suffix : ""
  }`;
  const iconTree = JSON.stringify(svgToIconTree(icon.content, icon.category));

  return `import { GenIcon, IconType } from '../lib/types';\n\nexport const ${componentName}: IconType = GenIcon(${iconTree});\n`;
}

function extractNameAndCount(name: string): {
  baseName: string;
  count: number;
} {
  const match = name.match(/^(.+?)(\d*)$/);
  if (match) {
    const [, baseName, countStr] = match;
    const count = countStr ? parseInt(countStr, 10) : 0;
    return { baseName, count };
  }
  return { baseName: name, count: 0 };
}

async function generateIconFile(
  icon: IconData,
  categoryDir: string,
  iconCounts: Record<string, number>
): Promise<string> {
  try {
    const { baseName: rawBaseName } = extractNameAndCount(icon.name);
    const baseName = pascalCase(sanitizeName(rawBaseName));

    if (!iconCounts[baseName]) {
      iconCounts[baseName] = 0;
    }
    iconCounts[baseName]++;
    const count = iconCounts[baseName];

    const fileName = `${baseName}${count > 1 ? count : ""}.ts`;
    const filePath = path.join(categoryDir, fileName);

    const fileContent = generateIconComponent(baseName, icon, count);

    await fs.writeFile(filePath, fileContent);

    return `${CATEGORY_ABBREVIATIONS[icon.category]}${baseName}${count > 1 ? count : ""}`;
  } catch (error) {
    console.error(`Error generating icon file for ${icon.name}:`, error);
    return "";
  }
}

async function generateCategoryFiles(
  category: string,
  icons: IconData[]
): Promise<void> {
  try {
    const categoryDir = path.join(
      OUTPUT_DIR,
      CATEGORY_ABBREVIATIONS[category].toLowerCase()
    );
    await fs.mkdir(categoryDir, { recursive: true });

    const iconCounts: Record<string, number> = {};
    const componentNames: string[] = [];

    for (const icon of icons) {
      const componentName = await generateIconFile(
        icon,
        categoryDir,
        iconCounts
      );
      if (componentName) {
        componentNames.push(componentName);
      }
    }

    // Generate index.ts file for the category
    const indexPath = path.join(categoryDir, "index.ts");
    const exportStatements = componentNames
      .map((componentName) => {
        const baseName = componentName.slice(2); // Remove category prefix
        return `export { ${componentName} } from './${baseName}';`;
      })
      .join("\n");

    await fs.writeFile(indexPath, exportStatements);
  } catch (error) {
    console.error(`Error generating category files for ${category}:`, error);
  }
}

async function readIconsDirectory(): Promise<Record<string, IconData[]>> {
  const iconsByCategory: Record<string, IconData[]> = {};

  try {
    const categories = await fs.readdir(ICONS_DIR, { withFileTypes: true });

    for (const categoryDirent of categories) {
      if (categoryDirent.isDirectory()) {
        const category = categoryDirent.name;
        const categoryPath = path.join(ICONS_DIR, category);
        const subcategories = await fs.readdir(categoryPath, {
          withFileTypes: true,
        });

        for (const subcategoryDirent of subcategories) {
          if (subcategoryDirent.isDirectory()) {
            const subcategoryPath = path.join(
              categoryPath,
              subcategoryDirent.name
            );
            const files = await fs.readdir(subcategoryPath, {
              withFileTypes: true,
            });

            for (const fileDirent of files) {
              if (
                fileDirent.isFile() &&
                path.extname(fileDirent.name) === ".svg"
              ) {
                const filePath = path.join(subcategoryPath, fileDirent.name);
                const content = await fs.readFile(filePath, "utf-8");
                const name = path.basename(fileDirent.name, ".svg");

                if (!iconsByCategory[category]) {
                  iconsByCategory[category] = [];
                }

                iconsByCategory[category].push({ name, category, content });
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error reading icons directory:", error);
  }

  return iconsByCategory;
}

async function generateIcons(): Promise<void> {
  const iconsByCategory = await readIconsDirectory();

  const generationPromises = Object.entries(iconsByCategory).map(
    async ([category, icons]) => {
      console.log(`Generating icons for category: ${category}`);
      await generateCategoryFiles(category, icons);
      console.log(
        `Finished generating ${icons.length} icons for category: ${category}`
      );
    }
  );

  await Promise.all(generationPromises);
}

generateIcons().catch((error) => {
  console.error("Error generating icons:", error);
});
