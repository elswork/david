/// Modelo inmutable y único de verdad para Artículos del Catálogo en Proyecto David.
///
/// Siguiendo la filosofía Anti-Overengineering, este único modelo se utiliza para la persistencia,
/// reglas de negocio y visualización en la interfaz de usuario.
class Article {
  final String id;
  final String code;
  final String barcode;
  final String name;
  final String description;
  final String category;
  final double price;
  final double vatRate;
  final int stock;
  final int minStock;
  final String unit;
  final String? imageUrl;
  final bool isActive;
  final DateTime updatedAt;

  const Article({
    required this.id,
    required this.code,
    required this.barcode,
    required this.name,
    required this.description,
    required this.category,
    required this.price,
    this.vatRate = 0.21,
    required this.stock,
    this.minStock = 5,
    this.unit = 'ud',
    this.imageUrl,
    this.isActive = true,
    required this.updatedAt,
  });

  /// Precio con IVA incluido.
  double get priceWithVat => price * (1 + vatRate);

  /// Alerta de stock bajo o reposición necesaria.
  bool get isLowStock => stock <= minStock;

  /// Indica si el artículo se encuentra agotado.
  bool get isOutOfStock => stock <= 0;

  /// Deserialización directa desde JSON / DocumentSnapshot.
  factory Article.fromJson(Map<String, dynamic> json, [String? id]) {
    return Article(
      id: id ?? (json['id'] as String? ?? ''),
      code: json['code'] as String? ?? '',
      barcode: json['barcode'] as String? ?? '',
      name: json['name'] as String? ?? '',
      description: json['description'] as String? ?? '',
      category: json['category'] as String? ?? 'General',
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      vatRate: (json['vatRate'] as num?)?.toDouble() ?? 0.21,
      stock: (json['stock'] as num?)?.toInt() ?? 0,
      minStock: (json['minStock'] as num?)?.toInt() ?? 5,
      unit: json['unit'] as String? ?? 'ud',
      imageUrl: json['imageUrl'] as String?,
      isActive: json['isActive'] as bool? ?? true,
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt'] as String) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  /// Serialización directa para persistencia en base de datos.
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'code': code,
      'barcode': barcode,
      'name': name,
      'description': description,
      'category': category,
      'price': price,
      'vatRate': vatRate,
      'stock': stock,
      'minStock': minStock,
      'unit': unit,
      'imageUrl': imageUrl,
      'isActive': isActive,
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  /// Copia inmutable con modificaciones puntuales.
  Article copyWith({
    String? id,
    String? code,
    String? barcode,
    String? name,
    String? description,
    String? category,
    double? price,
    double? vatRate,
    int? stock,
    int? minStock,
    String? unit,
    String? imageUrl,
    bool? isActive,
    DateTime? updatedAt,
  }) {
    return Article(
      id: id ?? this.id,
      code: code ?? this.code,
      barcode: barcode ?? this.barcode,
      name: name ?? this.name,
      description: description ?? this.description,
      category: category ?? this.category,
      price: price ?? this.price,
      vatRate: vatRate ?? this.vatRate,
      stock: stock ?? this.stock,
      minStock: minStock ?? this.minStock,
      unit: unit ?? this.unit,
      imageUrl: imageUrl ?? this.imageUrl,
      isActive: isActive ?? this.isActive,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Article && runtimeType == other.runtimeType && id == other.id;

  @override
  int get hashCode => id.hashCode;
}
