// Готовит иконку без альфа-канала и заставку для iOS из icons/icon-1024.png (CoreGraphics)
import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

let root = URL(fileURLWithPath: CommandLine.arguments[1])
let src = root.appendingPathComponent("icons/icon-1024.png")
guard let source = CGImageSourceCreateWithURL(src as CFURL, nil), let icon = CGImageSourceCreateImageAtIndex(source, 0, nil) else {
    fatalError("нет icons/icon-1024.png")
}

func render(size: Int, iconSize: CGFloat, to path: String) {
    let cs = CGColorSpace(name: CGColorSpace.sRGB)!
    // kCGImageAlphaNoneSkipLast — без прозрачности: App Store не принимает иконки с альфа-каналом
    let ctx = CGContext(data: nil, width: size, height: size, bitsPerComponent: 8, bytesPerRow: 0, space: cs,
                        bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue)!
    ctx.setFillColor(CGColor(colorSpace: cs, components: [0xf2 / 255.0, 0xcc / 255.0, 0x8f / 255.0, 1])!)
    ctx.fill(CGRect(x: 0, y: 0, width: size, height: size))
    let s = CGFloat(size)
    ctx.interpolationQuality = .high
    // рисуем иконку внутри скруглённого квадрата, чтобы углы не торчали
    let rect = CGRect(x: (s - iconSize) / 2, y: (s - iconSize) / 2, width: iconSize, height: iconSize)
    ctx.saveGState()
    ctx.addPath(CGPath(roundedRect: rect, cornerWidth: iconSize * 0.2, cornerHeight: iconSize * 0.2, transform: nil))
    ctx.clip()
    ctx.draw(icon, in: rect)
    ctx.restoreGState()
    let out = ctx.makeImage()!
    let url = root.appendingPathComponent(path)
    let dest = CGImageDestinationCreateWithURL(url as CFURL, UTType.png.identifier as CFString, 1, nil)!
    CGImageDestinationAddImage(dest, out, nil)
    guard CGImageDestinationFinalize(dest) else { fatalError("не удалось записать \(path)") }
}

render(size: 1024, iconSize: 1024, to: "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png")
for name in ["splash-2732x2732.png", "splash-2732x2732-1.png", "splash-2732x2732-2.png"] {
    render(size: 2732, iconSize: 760, to: "ios/App/App/Assets.xcassets/Splash.imageset/" + name)
}
print("иконка и заставка готовы")
