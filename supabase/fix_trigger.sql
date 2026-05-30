-- 1. Xóa trigger cũ chứa logic xác thực kém an toàn
DROP TRIGGER IF EXISTS notify_telegram_on_booking ON public.bookings;
DROP FUNCTION IF EXISTS public.fn_notify_telegram_on_booking;

-- 2. Tạo lại hàm trigger với cơ chế xác thực an toàn bằng trigger secret
CREATE OR REPLACE FUNCTION public.fn_notify_telegram_on_booking()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  PERFORM
    net.http_post(
      url := 'https://aijobwikxttiwshznrqm.supabase.co/functions/v1/send-telegram',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer d7b3f942-8e1d-4f1a-96b3-fc7d9214b7e8'
      ),
      body := jsonb_build_object('record', row_to_json(NEW))
    );
  RETURN NEW;
END;
$function$;

-- 3. Đăng ký trigger hoạt động AFTER INSERT trên bảng public.bookings
CREATE TRIGGER notify_telegram_on_booking
AFTER INSERT ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.fn_notify_telegram_on_booking();