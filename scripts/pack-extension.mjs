/**
 * Writes release/swift-selection-search-brave.zip with the contents of src/
 * (manifest at zip root), and mirrors the same tree under
 * release/swift-selection-search/ for “Load unpacked” updates. Excludes *.ts
 * sources. Run after `npm run build`.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import archiver from "archiver";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcRoot = path.join(__dirname, "..", "src");
const releaseDir = path.join(__dirname, "..", "release");
const unpackedRoot = path.join(releaseDir, "swift-selection-search");
const zipPath = path.join(releaseDir, "swift-selection-search-brave.zip");

function walkFiles(dir, baseDir) {
	/** @type {{ full: string; entryName: string }[]} */
	const out = [];
	for (const name of fs.readdirSync(dir)) {
		const full = path.join(dir, name);
		const rel = path.relative(baseDir, full).split(path.sep).join("/");
		const st = fs.statSync(full);
		if (st.isDirectory()) {
			out.push(...walkFiles(full, baseDir));
		} else if (!name.endsWith(".ts")) {
			out.push({ full, entryName: rel });
		}
	}
	return out;
}

await fs.promises.mkdir(releaseDir, { recursive: true });

const files = walkFiles(srcRoot, srcRoot);
if (!files.some((f) => f.entryName === "manifest.json")) {
	console.error("Missing src/manifest.json — run npm run build first.");
	process.exit(1);
}

await fs.promises.rm(unpackedRoot, { recursive: true, force: true });
await fs.promises.mkdir(unpackedRoot, { recursive: true });
for (const { full, entryName } of files) {
	const dest = path.join(unpackedRoot, entryName);
	await fs.promises.mkdir(path.dirname(dest), { recursive: true });
	await fs.promises.copyFile(full, dest);
}
console.log("Copied unpacked extension to:", unpackedRoot);

const output = fs.createWriteStream(zipPath);
const archive = archiver("zip", { zlib: { level: 9 } });

await new Promise((resolve, reject) => {
	output.on("close", resolve);
	archive.on("error", reject);
	archive.pipe(output);
	for (const { full, entryName } of files) {
		archive.file(full, { name: entryName });
	}
	archive.finalize();
});

console.log("Packed extension:", zipPath);
console.log("Zip bytes:", archive.pointer());
