package it.dimoramia.owner;

import android.content.Context;
import android.graphics.*;
import android.view.View;

final class NavIcon extends View {
  private final String kind;
  private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);

  NavIcon(Context context, String kind, int color) {
    super(context);
    this.kind = kind;
    paint.setColor(color);
    paint.setStyle(Paint.Style.STROKE);
    paint.setStrokeWidth(1.7f);
    paint.setStrokeCap(Paint.Cap.ROUND);
    paint.setStrokeJoin(Paint.Join.ROUND);
    setImportantForAccessibility(IMPORTANT_FOR_ACCESSIBILITY_NO);
  }

  @Override
  protected void onDraw(Canvas canvas) {
    super.onDraw(canvas);
    canvas.save();
    canvas.scale(getWidth() / 24f, getHeight() / 24f);
    Path p = new Path();
    switch (kind) {
      case "overview":
        p.moveTo(3, 11);
        p.lineTo(12, 3);
        p.lineTo(21, 11);
        p.moveTo(5, 10);
        p.lineTo(5, 21);
        p.lineTo(10, 21);
        p.lineTo(10, 15);
        p.lineTo(14, 15);
        p.lineTo(14, 21);
        p.lineTo(19, 21);
        p.lineTo(19, 10);
        canvas.drawPath(p, paint);
        break;
      case "calendar":
        canvas.drawRoundRect(3, 5, 21, 21, 3, 3, paint);
        canvas.drawLine(3, 10, 21, 10, paint);
        canvas.drawLine(8, 3, 8, 7, paint);
        canvas.drawLine(16, 3, 16, 7, paint);
        canvas.drawPoint(8, 14, paint);
        canvas.drawPoint(12, 14, paint);
        canvas.drawPoint(16, 14, paint);
        canvas.drawPoint(8, 18, paint);
        canvas.drawPoint(12, 18, paint);
        break;
      case "reservations":
        canvas.drawCircle(9, 7, 3, paint);
        canvas.drawArc(2, 13, 16, 24, 180, 180, false, paint);
        canvas.drawCircle(18, 9, 2.5f, paint);
        canvas.drawArc(14, 15, 23, 25, 180, 180, false, paint);
        break;
      case "finance":
        canvas.drawRoundRect(3, 5, 21, 21, 3, 3, paint);
        canvas.drawRoundRect(14, 11, 22, 17, 2, 2, paint);
        canvas.drawPoint(18, 14, paint);
        canvas.drawLine(5, 5, 17, 2, paint);
        break;
      default:
        for (int y : new int[] {6, 12, 18}) canvas.drawLine(3, y, 21, y, paint);
        canvas.drawCircle(8, 6, 2, paint);
        canvas.drawCircle(16, 12, 2, paint);
        canvas.drawCircle(10, 18, 2, paint);
    }
    canvas.restore();
  }
}
