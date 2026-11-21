package it.dimoramia.owner;

import android.animation.*;
import android.content.Context;
import android.graphics.*;
import android.view.View;
import android.view.animation.LinearInterpolator;

final class SyncIndicator extends View {
  private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
  private boolean busy;
  private float angle;
  private ValueAnimator animator;

  SyncIndicator(Context c) {
    super(c);
    setContentDescription("Aggiorna calendario");
    setFocusable(true);
    setClickable(true);
    paint.setStyle(Paint.Style.STROKE);
    paint.setStrokeWidth(1.8f);
    paint.setStrokeCap(Paint.Cap.ROUND);
    paint.setStrokeJoin(Paint.Join.ROUND);
  }

  void setBusy(boolean value) {
    busy = value;
    setEnabled(!value);
    setContentDescription(value ? "Aggiornamento calendario in corso" : "Aggiorna calendario");
    update();
    invalidate();
  }

  private void update() {
    if (animator != null) {
      animator.cancel();
      animator = null;
    }
    if (busy
        && isShown()
        && getWindowVisibility() == View.VISIBLE
        && ValueAnimator.areAnimatorsEnabled()) {
      animator = ValueAnimator.ofFloat(0, 360);
      animator.setDuration(1000);
      animator.setRepeatCount(ValueAnimator.INFINITE);
      animator.setInterpolator(new LinearInterpolator());
      animator.addUpdateListener(
          a -> {
            angle = (float) a.getAnimatedValue();
            invalidate();
          });
      animator.start();
    } else angle = 0;
  }

  @Override
  protected void onAttachedToWindow() {
    super.onAttachedToWindow();
    update();
  }

  @Override
  protected void onDetachedFromWindow() {
    if (animator != null) {
      animator.cancel();
      animator = null;
    }
    super.onDetachedFromWindow();
  }

  @Override
  protected void onWindowVisibilityChanged(int visibility) {
    super.onWindowVisibilityChanged(visibility);
    update();
  }

  @Override
  protected void onDraw(Canvas c) {
    super.onDraw(c);
    c.save();
    float size = Math.min(getWidth(), getHeight()) * .48f;
    c.translate((getWidth() - size) / 2, (getHeight() - size) / 2);
    c.scale(size / 24f, size / 24f);
    RectF ring = new RectF(4, 4, 20, 20);
    paint.setColor(Color.rgb(240, 237, 223));
    if (busy) {
      c.drawArc(ring, angle - 90, 255, false, paint);
      paint.setColor(Color.rgb(219, 184, 126));
      c.drawArc(ring, angle + 165, 32, false, paint);
    } else {
      c.drawArc(ring, -38, 294, false, paint);
      Path arrow = new Path();
      arrow.moveTo(16, 3);
      arrow.lineTo(20, 5);
      arrow.lineTo(20, 1);
      c.drawPath(arrow, paint);
    }
    c.restore();
  }
}
