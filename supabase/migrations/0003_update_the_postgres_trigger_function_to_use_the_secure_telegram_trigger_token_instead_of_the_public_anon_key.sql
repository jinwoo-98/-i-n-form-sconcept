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