use kaleidoswap_uniffi::KaleidoError;

fn main() {
    let err = KaleidoError::NetworkError {
        message: "Connection failed".to_string()
    };
    
    println!("Display: {}", err);
    println!("Debug: {:?}", err);
}
