// Готовит иконку без альфа-канала и заставку для iOS из icons/icon-1024.png
import Foundation
import AppKit

let root = URL(fileURLWithPath: CommandLine.arguments[1])
let src = root.appendingPathComponent("icons/icon-1024.png")
guard let icon = NSImage(contentsOf: src) else { fatalError("нет icons/icon-1024.png") }

func render(size: Int, bg: NSColor, iconSize: CGFloat, to path: String) {
    let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: size, pixelsHigh: size, bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
    bg.setFill(); NSRect(x: 0, y: 0, width: size, height: size).fill()
    let s = CGFloat(size)
    icon.draw(in: NSRect(x: (s - iconSize) / 2, y: (s - iconSize) / 2, width: iconSize, height: iconSize), from: .zero, operation: .sourceOver, fraction: 1)
    NSGraphicsContext.restoreGraphicsState()
    // сбрасываем альфу: App Store не принимает иконки с прозрачностью
    let flat = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: size, pixelsHigh: size, bitsPerSample: 8, samplesPerPixel: 3, hasAlpha: false, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: flat)
    rep.draw(in: NSRect(x: 0, y: 0, width: size, height: size))
    NSGraphicsContext.restoreGraphicsState()
    try! flat.representation(using: .png, properties: [:])!.write(to: root.appendingPathComponent(path))
}

let butter = NSColor(red: 0xf2/255, green: 0xcc/255, blue: 0x8f/255, alpha: 1)
render(size: 1024, bg: butter, iconSize: 1024, to: "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png")
for name in ["splash-2732x2732.png", "splash-2732x2732-1.png", "splash-2732x2732-2.png"] {
    render(size: 2732, bg: butter, iconSize: 760, to: "ios/App/App/Assets.xcassets/Splash.imageset/" + name)
}
print("иконка и заставка готовы")
