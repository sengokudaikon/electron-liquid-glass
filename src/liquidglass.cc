#include <napi.h>
#include <string>

#ifdef __APPLE__
extern "C" int AddGlassEffectView(unsigned char *buffer);
extern "C" void ConfigureGlassView(int viewId, double cornerRadius, const char *tintHex);
#endif

// Create a class that will be exposed to JavaScript
class LiquidGlassNative : public Napi::ObjectWrap<LiquidGlassNative>
{
public:
  // This static method defines the class for JavaScript
  static Napi::Object Init(Napi::Env env, Napi::Object exports)
  {
    // Define the JavaScript class with method(s)
    Napi::Function func = DefineClass(env, "LiquidGlassNative", {InstanceMethod("addView", &LiquidGlassNative::AddView)});

    // Create a persistent reference to the constructor
    Napi::FunctionReference *constructor = new Napi::FunctionReference();
    *constructor = Napi::Persistent(func);
    env.SetInstanceData(constructor);

    // Set the constructor on the exports object
    exports.Set("LiquidGlassNative", func);
    return exports;
  }

  // Constructor
  LiquidGlassNative(const Napi::CallbackInfo &info)
      : Napi::ObjectWrap<LiquidGlassNative>(info) {}

private:
  // New AddView method
  Napi::Value AddView(const Napi::CallbackInfo &info)
  {
    Napi::Env env = info.Env();

    if (info.Length() < 1 || !info[0].IsBuffer())
    {
      Napi::TypeError::New(env, "Expected first argument to be a Buffer returned by getNativeWindowHandle()").ThrowAsJavaScriptException();
      return env.Null();
    }

    double radius = 0.0;
    std::string tint;
    if (info.Length() >= 2 && info[1].IsObject())
    {
      auto obj = info[1].As<Napi::Object>();
      if (obj.Has("cornerRadius") && obj.Get("cornerRadius").IsNumber())
      {
        radius = obj.Get("cornerRadius").As<Napi::Number>().DoubleValue();
      }
      if (obj.Has("tintColor") && obj.Get("tintColor").IsString())
      {
        tint = obj.Get("tintColor").As<Napi::String>().Utf8Value();
      }
    }

    auto buffer = info[0].As<Napi::Buffer<unsigned char>>();

#ifdef __APPLE__
    int viewId = AddGlassEffectView(buffer.Data());
    if (viewId >= 0)
    {
      ConfigureGlassView(viewId, radius, tint.c_str());
    }
    return Napi::Number::New(env, viewId);
#else
    // Not supported on this platform yet
    return Napi::Number::New(env, -1);
#endif
  }
};

// Initialize the addon
Napi::Object Init(Napi::Env env, Napi::Object exports)
{
  return LiquidGlassNative::Init(env, exports);
}

// Register the initialization function
NODE_API_MODULE(liquidglass, Init)