// Режет картинку с несколькими предметами в ряд (фон уже прозрачный после keyout) на отдельные спрайты.
// Предметы ищутся по полностью прозрачным столбцам между ними.
// swift split.swift <in.png> <maxHeight> <out1.png> <out2.png> ...
import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

let args = CommandLine.arguments
let inURL = URL(fileURLWithPath: args[1])
let maxH = Int(args[2]) ?? 200
let outs = Array(args.dropFirst(3))
guard let src = CGImageSourceCreateWithURL(inURL as CFURL, nil), let img = CGImageSourceCreateImageAtIndex(src, 0, nil) else { fatalError("нет файла") }
let w = img.width, h = img.height
let cs = CGColorSpace(name: CGColorSpace.sRGB)!
let ctx = CGContext(data: nil, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4, space: cs, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
ctx.draw(img, in: CGRect(x: 0, y: 0, width: w, height: h))
let data = ctx.data!.bindMemory(to: UInt8.self, capacity: w * h * 4)
let solid = (0..<w).map { x in (0..<h).contains { y in data[(y * w + x) * 4 + 3] > 40 } }
// непрерывные куски непустых столбцов; короткие провалы (меньше 6 px) склеиваем
var runs: [(Int, Int)] = []
var x = 0
while x < w {
    if !solid[x] { x += 1; continue }
    var end = x
    while end < w {
        if solid[end] { end += 1; continue }
        var gap = end
        while gap < w && !solid[gap] { gap += 1 }
        if gap - end < 6 && gap < w { end = gap } else { break }
    }
    if end - x > 12 { runs.append((x, end)) }
    x = end
}
guard runs.count == outs.count else { fatalError("нашёл \(runs.count) предметов, а файлов \(outs.count)") }
let full = ctx.makeImage()!
for (k, (x0, x1)) in runs.enumerated() {
    var y0 = h, y1 = 0
    for y in 0..<h { for xx in x0..<x1 where data[(y * w + xx) * 4 + 3] > 40 { y0 = min(y0, y); y1 = max(y1, y); break } }
    let pad = 4
    let rect = CGRect(x: max(0, x0 - pad), y: max(0, y0 - pad), width: min(w, x1 + pad) - max(0, x0 - pad), height: min(h, y1 + pad) - max(0, y0 - pad))
    let part = full.cropping(to: rect)!
    let scale = min(1, CGFloat(maxH) / CGFloat(part.height))
    let ow = Int(CGFloat(part.width) * scale), oh = Int(CGFloat(part.height) * scale)
    let small = CGContext(data: nil, width: ow, height: oh, bitsPerComponent: 8, bytesPerRow: 0, space: cs, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
    small.interpolationQuality = .high
    small.draw(part, in: CGRect(x: 0, y: 0, width: ow, height: oh))
    let dest = CGImageDestinationCreateWithURL(URL(fileURLWithPath: outs[k]) as CFURL, UTType.png.identifier as CFString, 1, nil)!
    CGImageDestinationAddImage(dest, small.makeImage()!, nil)
    guard CGImageDestinationFinalize(dest) else { fatalError("не записалось") }
    print("\(URL(fileURLWithPath: outs[k]).lastPathComponent): \(ow)x\(oh)")
}
