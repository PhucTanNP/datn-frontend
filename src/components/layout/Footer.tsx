export function Footer() {
  return (
    <footer className="w-full border-t bg-background py-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="font-bold text-xl mb-4">DRC Tires</h3>
            <p className="text-muted-foreground mb-4">
              Chuyên lốp xe chất lượng cao với AI kiểm tra độ mòn tiên tiến.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Sản phẩm</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/products" className="hover:underline">Lốp xe máy</a></li>
              <li><a href="/products" className="hover:underline">Lốp ô tô</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/inspect" className="hover:underline">Kiểm tra lốp</a></li>
              <li><a href="#" className="hover:underline">Liên hệ</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t pt-8 mt-8 text-center text-sm text-muted-foreground">
          © 2026 DRC Tires. All rights reserved.
        </div>
      </div>
    </footer>
  );
}