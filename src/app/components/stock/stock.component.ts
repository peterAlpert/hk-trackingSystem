import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { StockService } from '../../services/stock.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stock.component.html',
  styleUrl: './stock.component.css'
})
export class StockComponent {
  items: any[] = [];
  newItemName = '';

  selectedItemId: number | null = null;
  increaseQty: number | null = null;
  qtyError2: string = '';

  newItemQty: number | null = null;
  qtyError: string = '';

  constructor(private stockService: StockService) { }

  ngOnInit() {
    this.load();
  }

  onIncreaseInput(event: any) {
    let value = event.target.value;

    const arabicNumbers = '٠١٢٣٤٥٦٧٨٩';
    const englishNumbers = '0123456789';

    value = value.replace(/[٠-٩]/g, (d: string) => {
      return englishNumbers[arabicNumbers.indexOf(d)];
    });

    value = value.replace(/[^0-9]/g, '');

    this.increaseQty = value ? +value : null;

    if (this.increaseQty && this.increaseQty <= 0) {
      this.qtyError2 = '⚠️ لازم تدخل رقم أكبر من صفر';
    } else {
      this.qtyError2 = '';
    }
  }

  increaseExistingItem() {
    if (!this.selectedItemId || !this.increaseQty || this.increaseQty <= 0) {
      this.qtyError2 = '⚠️ أدخل رقم صحيح';
      return;
    }

    const item = this.items.find(x => x.id === this.selectedItemId);

    if (!item) return;

    const newQty = item.quantity + this.increaseQty;

    this.stockService.updateQuantity(item.id, newQty).subscribe(() => {
      item.quantity = newQty;

      Swal.fire({
        icon: 'success',
        title: 'تم التزويد بنجاح',
        timer: 1200,
        showConfirmButton: false
      });

      // Reset
      this.selectedItemId = null;
      this.increaseQty = null;
    });
  }

  onFocusQty() {
    if (this.newItemQty === 0) {
      this.newItemQty = null;
    }
  }

  // 👇 validation
  validateQty() {
    if (this.newItemQty === null) {
      this.qtyError = '';
      return;
    }

    if (this.newItemQty <= 0) {
      this.qtyError = '⚠️ لازم تدخل رقم أكبر من صفر';
    } else {
      this.qtyError = '';
    }
  }

  onQtyInput(event: any) {
    let value = event.target.value;

    // 🔥 تحويل الأرقام العربي لإنجليزي
    const arabicNumbers = '٠١٢٣٤٥٦٧٨٩';
    const englishNumbers = '0123456789';

    value = value.replace(/[٠-٩]/g, (d: string) => {
      return englishNumbers[arabicNumbers.indexOf(d)];
    });

    // 👇 نخليها أرقام بس
    value = value.replace(/[^0-9]/g, '');

    // تحديث القيمة
    this.newItemQty = value ? +value : null;

    // validation
    this.validateQty();
  }

  load() {
    this.stockService.getAll().subscribe((res: any) => {
      this.items = res;
      this.checkLowStock();
    });
  }

  addItem() {
    if (!this.newItemName || !this.newItemQty || this.newItemQty <= 0) {
      this.qtyError = '⚠️ أدخل رقم صحيح';
      return;
    }

    // 👇 ندور على المنتج (case insensitive)
    const existingItem = this.items.find(
      x => x.name.trim().toLowerCase() === this.newItemName.trim().toLowerCase()
    );

    if (existingItem) {
      // ✅ المنتج موجود → نزود الكمية
      const newQty = existingItem.quantity + this.newItemQty;

      this.stockService.updateQuantity(existingItem.id, newQty).subscribe(() => {
        existingItem.quantity = newQty;

        Swal.fire({
          icon: 'success',
          title: 'تم تحديث الكمية',
          timer: 1200,
          showConfirmButton: false
        });
      });

    } else {
      // ✅ منتج جديد
      this.stockService.add({
        name: this.newItemName,
        quantity: this.newItemQty
      }).subscribe(() => {
        this.load();

        Swal.fire({
          icon: 'success',
          title: 'تمت الإضافة',
          timer: 1200,
          showConfirmButton: false
        });
      });
    }

    // Reset
    this.newItemName = '';
    this.newItemQty = null;
  }


  increase(item: any) {
    this.stockService.increase(item.id).subscribe(() => {
      item.quantity++;
    });
  }

  decrease(item: any) {
    this.stockService.decrease(item.id).subscribe(() => {
      if (item.quantity > 0) item.quantity--;

      if (item.quantity <= 3) {
        Swal.fire({
          icon: 'warning',
          title: '⚠️ الكمية قليلة',
          text: `${item.name} قرب يخلص`
        });
      }
    });
  }

  delete(item: any) {
    Swal.fire({
      title: 'هل أنت متأكد؟',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'تأكيد',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d'
    }).then(res => {
      if (res.isConfirmed) {
        this.stockService.delete(item.id).subscribe(() => {
          this.load();

          Swal.fire({
            icon: 'success',
            title: 'تم الحذف بنجاح',
            timer: 1200,
            showConfirmButton: false
          });
        });
      }
    });
  }

  checkLowStock() {
    const lowItems = this.items.filter(i => i.quantity <= 3);

    if (lowItems.length > 0) {
      const names = lowItems.map(i => i.name).join(' , ');

      Swal.fire({
        icon: 'warning',
        title: 'تنبيه مخزون',
        text: `في منتجات قربت تخلص: ${names}`
      });
    }
  }


  decreaseItemId: number | null = null;
  decreaseQty: number | null = null;
  qtyError3: string = '';

  onDecreaseInput(event: any) {
    let value = event.target.value;

    const arabicNumbers = '٠١٢٣٤٥٦٧٨٩';
    const englishNumbers = '0123456789';

    value = value.replace(/[٠-٩]/g, (d: string) => {
      return englishNumbers[arabicNumbers.indexOf(d)];
    });

    value = value.replace(/[^0-9]/g, '');

    this.decreaseQty = value ? +value : null;

    if (this.decreaseQty && this.decreaseQty <= 0) {
      this.qtyError3 = '⚠️ لازم تدخل رقم أكبر من صفر';
    } else {
      this.qtyError3 = '';
    }
  }

  decreaseExistingItem() {
    if (!this.decreaseItemId || !this.decreaseQty || this.decreaseQty <= 0) {
      this.qtyError3 = '⚠️ أدخل رقم صحيح';
      return;
    }

    const item = this.items.find(x => x.id === this.decreaseItemId);
    if (!item) return;

    if (this.decreaseQty > item.quantity) {
      Swal.fire({
        icon: 'error',
        title: 'خطأ',
        text: 'الكمية المطلوبة أكبر من الموجود'
      });
      return;
    }

    const newQty = item.quantity - this.decreaseQty;

    this.stockService.updateQuantity(item.id, newQty).subscribe(() => {
      item.quantity = newQty;

      Swal.fire({
        icon: 'success',
        title: 'تم التقليل بنجاح',
        timer: 1200,
        showConfirmButton: false
      });

      if (newQty <= 3) {
        Swal.fire({
          icon: 'warning',
          title: '⚠️ الكمية قليلة',
          text: `${item.name} قرب يخلص`
        });
      }

      // Reset
      this.decreaseItemId = null;
      this.decreaseQty = null;
    });
  }

}
