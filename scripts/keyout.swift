// Вырезает зелёный хромакей-фон из сгенерированной картинки, обрезает по содержимому и уменьшает.
// swift keyout.swift <in.png> <out.png> <maxWidth> [crop=1|0]
import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

let args = CommandLine.arguments
let inURL = URL(fileURLWithPath: args[1]), outURL = URL(fileURLWithPath: args[2])
let maxW = Int(args[3]) ?? 512
let crop = args.count > 4 ? args[4] == "1" : true
guard let src = CGImageSourceCreateWithURL(inURL as CFURL, nil), let img = CGImageSourceCreateImageAtIndex(src, 0, nil) else { fatalError("нет файла") }
let w = img.width, h = img.height
let cs = CGColorSpace(name: CGColorSpace.sRGB)!
let ctx = CGContext(data: nil, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4, space: cs, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
ctx.draw(img, in: CGRect(x: 0, y: 0, width: w, height: h))
let data = ctx.data!.bindMemory(to: UInt8.self, capacity: w * h * 4)
var minX = w, minY = h, maxX = 0, maxY = 0
for y in 0..<h {
    for x in 0..<w {
        let i = (y * w + x) * 4
        let r = Float(data[i]), g = Float(data[i + 1]), b = Float(data[i + 2])
        // насколько пиксель «зелёный»: g сильно больше r и b
        let dom = g - max(r, b)
        var alpha: Float = 1
        if dom > 90 { alpha = 0 }
        else if dom > 30 { alpha = 1 - (dom - 30) / 60 }
        if alpha < 1 {
            // убираем зелёный ореол на полупрозрачных краях
            let ng = min(g, max(r, b) + 10)
            data[i] = UInt8(r * alpha); data[i + 1] = UInt8(ng * alpha); data[i + 2] = UInt8(b * alpha); data[i + 3] = UInt8(255 * alpha)
        }
        if alpha > 0.05 { minX = min(minX, x); minY = min(minY, y); maxX = max(maxX, x); maxY = max(maxY, y) }
    }
}
var out = ctx.makeImage()!
if crop && maxX > minX {
    let pad = 6
    let rect = CGRect(x: max(0, minX - pad), y: max(0, minY - pad), width: min(w, maxX + pad) - max(0, minX - pad), height: min(h, maxY + pad) - max(0, minY - pad))
    out = out.cropping(to: rect)!
}
let scale = min(1, CGFloat(maxW) / CGFloat(out.width))
let ow = Int(CGFloat(out.width) * scale), oh = Int(CGFloat(out.height) * scale)
let small = CGContext(data: nil, width: ow, height: oh, bitsPerComponent: 8, bytesPerRow: 0, space: cs, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
small.interpolationQuality = .high
small.draw(out, in: CGRect(x: 0, y: 0, width: ow, height: oh))
let dest = CGImageDestinationCreateWithURL(outURL as CFURL, UTType.png.identifier as CFString, 1, nil)!
CGImageDestinationAddImage(dest, small.makeImage()!, nil)
guard CGImageDestinationFinalize(dest) else { fatalError("не записалось") }
print("\(outURL.lastPathComponent): \(ow)x\(oh)")
